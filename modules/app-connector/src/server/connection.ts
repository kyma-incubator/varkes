#!/usr/bin/env node
"use strict";

import * as fs from "fs";
import * as path from "path";
import * as config from "@varkes/configuration";
import * as kymaConnector from "./kyma/connector";
import * as compassConnector from "./compass/connector";

const LOGGER: any = config.logger("app-connector");
const forge = require("node-forge");
const keysDirectory = path.resolve("keys");
const connFile = path.resolve(keysDirectory, "connection.json");
const crtFile = path.resolve(keysDirectory, "kyma.crt");
const privateKeyFile = path.resolve(keysDirectory, "app.key");
const CronJob = require("cron").CronJob;

var privateKeyData: Buffer;
var certificateData: Buffer;
var connection: Info | null = null;

var jobRenewCertificateStarted: Boolean = false;
//"0 */1 * * * *" - every minute
//"00 00 1 * * *" - 1am once a day
const RENEWCERT_JOB_CRON = process.env.RENEWCERT_JOB_CRON || "00 00 1 * * *";
LOGGER.info("Setting jobRenewCertificate schedule to: %s", RENEWCERT_JOB_CRON);
const jobRenewCertificate = new CronJob(RENEWCERT_JOB_CRON, function () {
  jobRenewCertificateStarted = true;
  renewCertificate();
});

export function init() {
  if (!fs.existsSync(keysDirectory)) {
    fs.mkdirSync(keysDirectory);
  }

  if (fs.existsSync(privateKeyFile)) {
    privateKeyData = fs.readFileSync(privateKeyFile);
    LOGGER.info("Found existing private key: %s", privateKeyFile);
  } else {
    privateKeyData = generatePrivateKey(privateKeyFile);
  }

  if (fs.existsSync(connFile)) {
    connection = JSON.parse(fs.readFileSync(connFile, "utf8"));
    LOGGER.info("Found existing connection info: %s", connFile);
  }

  if (fs.existsSync(crtFile)) {
    certificateData = fs.readFileSync(crtFile);
    LOGGER.info("Found existing certificate: %s", crtFile);
  }

  if (privateKeyData && certificateData && connection) {
    LOGGER.info("Found existing files, certificate renewal job will run at %s", jobRenewCertificate.nextDates()._d);
    jobRenewCertificate.start();
  }
}

function establish(newConnection: Info, newCertificate: Buffer) {
  connection = newConnection;
  certificateData = newCertificate;

  if (connection.persistFiles) {
    fs.writeFileSync(connFile, JSON.stringify(connection, null, 2), {encoding: "utf8", flag: "w"});
    fs.writeFileSync(crtFile, certificateData, {encoding: "utf8", flag: "w"});
  }

  if (!jobRenewCertificateStarted) {
    LOGGER.info("Connecting established: certificate renewal job will run at %s", jobRenewCertificate.nextDates()._d);
    jobRenewCertificate.start();
  }

  LOGGER.info("Connected to %s", connection.metadataUrl);

  return connection;
}

export function certificate(): Buffer {
  if (!established()) {
    throw new Error(
      "Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status"
    );
  }
  return certificateData;
}

export function privateKey(): Buffer {
  return privateKeyData;
}

export function established(): boolean {
  return connection != null;
}

function generatePrivateKey(filePath: string): Buffer {
  LOGGER.debug("Generating new private key: %s", filePath);
  let keys = forge.pki.rsa.generateKeyPair(2048);
  const key = forge.pki.privateKeyToPem(keys.privateKey);
  fs.writeFileSync(filePath, key);
  LOGGER.info("Generated new private key: %s", filePath);
  return Buffer.from(key);
}

export function info(): Info {
  if (!established()) {
    throw new Error(
      "Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status"
    );
  }
  return connection!;
}

export function destroy(): void {
  connection = null;

  if (fs.existsSync(connFile)) {
    fs.unlinkSync(connFile);
  }
  if (fs.existsSync(crtFile)) {
    fs.unlinkSync(crtFile);
  }

  jobRenewCertificate.stop();
  jobRenewCertificateStarted = false;
}

export async function connect(token: string, persistFiles: boolean = true, insecure: boolean = false): Promise<Info> {
  if (!token) {
    throw new Error("A token is required to establish a connection");
  }

  if (token.startsWith("http://") || token.startsWith("https://")) {
    return kymaConnector.connect(token, persistFiles, insecure).then((result) => {
      return establish(result.connection, result.certificate);
    });
  }
  return compassConnector.connect(token, persistFiles, insecure).then((result) => {
    return establish(result.connection, result.certificate);
  });
}

export async function legacyEventsUrl(): Promise<string> {
  if (connection!.type === Type.Kyma) return kymaConnector.legacyEventsUrl();
  else return compassConnector.legacyEventsUrl();
}

export async function cloudEventsUrl(): Promise<string> {
  if (connection!.type === Type.Kyma) return kymaConnector.cloudEventsUrl();
  else return compassConnector.cloudEventsUrl();
}

export type Info = {
  insecure: boolean;
  persistFiles: boolean;
  metadataUrl: string;
  infoUrl: string | null;
  renewCertUrl: string | null;
  revocationCertUrl: string | null;
  consoleUrl: string;
  applicationUrl: string;
  application: string;
  type: Type;
};

export enum Type {
  Kyma = "Kyma",
  Compass = "Compass",
}
export async function renewCertificate() {
  if (established() && connection!.renewCertUrl) {
    try {
      LOGGER.info("Calling cert renewal procedure for %s connection: %s", connection!.type, connection!.renewCertUrl);
      if (connection!.type === Type.Kyma) {
        certificateData = await kymaConnector.renewCertificate(
          connection!.renewCertUrl,
          certificateData,
          privateKeyData,
          connection!.insecure
        );
      } else {
        certificateData = await compassConnector.renewCertificate(connection!, certificateData, privateKeyData);
      }

      const cert = forge.pki.certificateFromPem(certificateData);
      LOGGER.info("Certificate successfully renewed... job will run again at %s", jobRenewCertificate.nextDates()._d);
      LOGGER.info("Certificate valid between: %s and %s", cert.validity.notBefore, cert.validity.notAfter);

      if (connection?.persistFiles) {
        fs.writeFileSync(crtFile, certificateData, {encoding: "utf8", flag: "w"});
      }
    } catch (error) {
      LOGGER.error("Certificate renewal failed, a new connection url may be needed to reestablished the connection: ", error);
      throw error
    }
  } else {
    LOGGER.info("no connection established... renewCertificate not performed");
  }
}
