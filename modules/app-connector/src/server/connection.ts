#!/usr/bin/env node
"use strict";

import * as fs from "fs";
import * as path from "path";
import * as config from "@varkes/configuration";
import * as kymaConnector from "./kyma/connector";
import * as compassConnector from "./compass/connector";
import * as common from "./common";

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
var jobRenewCertificatePersistFile: Boolean = false;
const jobRenewCertificate = new CronJob("00 00 1 * * *", function () {
  console.log("Running certificate renewal job...");
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
    console.log("Starting certificate renewal job...");
    jobRenewCertificateStarted = true;
    jobRenewCertificatePersistFile = true;
    jobRenewCertificate.start();
  }
}

function establish(newConnection: Info, newCertificate: Buffer, persistFiles: boolean) {
  connection = newConnection;
  certificateData = newCertificate;

  if (persistFiles) {
    fs.writeFileSync(connFile, JSON.stringify(connection, null, 2), {encoding: "utf8", flag: "wx"});
    fs.writeFileSync(crtFile, certificateData, {encoding: "utf8", flag: "wx"});
    jobRenewCertificatePersistFile = true;
  }

  if (!jobRenewCertificateStarted) {
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
}

export async function connect(token: string, persistFiles: boolean = true, insecure: boolean = false): Promise<Info> {
  if (!token) {
    throw new Error("A token is required to establish a connection");
  }

  if (token.startsWith("http://") || token.startsWith("https://")) {
    return kymaConnector.connect(token, insecure).then((result) => {
      return establish(result.connection, result.certificate, persistFiles);
    });
  }
  return compassConnector.connect(token, insecure).then((result) => {
    return establish(result.connection, result.certificate, persistFiles);
  });
}

export async function eventsUrl(): Promise<string> {
  if (connection!.type === Type.Kyma) return kymaConnector.eventsUrl();
  else return compassConnector.eventsUrl();
}

export type Info = {
  insecure: boolean;
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

async function renewCertificate() {
  if (established()) {
    var subject: any = common.parseSubjectFromCert(certificateData);
    const csr = common.generateCSR(subject, privateKeyData);

    if (connection!.type === Type.Kyma && connection!.renewCertUrl) {
      LOGGER.info("Calling cert renewal: ", connection!.renewCertUrl);

      try {
        let reNewedCertificateData: any = await kymaConnector.renewCertificate(
          connection!.renewCertUrl,
          csr,
          certificateData,
          privateKeyData
        );
        if (jobRenewCertificatePersistFile) {
          fs.writeFileSync(crtFile, reNewedCertificateData, {encoding: "utf8", flag: "wx"});
        }
      } catch (error) {
        LOGGER.debug("An error occurred while attempting to renew certificate: ", error);
      }
    }
  } else {
    LOGGER.info("no connection established... renewCertificate not performed");
  }
}
