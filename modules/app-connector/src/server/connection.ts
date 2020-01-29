#!/usr/bin/env node
'use strict'

import * as fs from 'fs';
import * as path from 'path';
import * as config from "@varkes/configuration"
import * as kymaConnector from './kyma/connector';
import * as compassConnector from './compass/connector';

const LOGGER: any = config.logger("app-connector")
const forge = require("node-forge");
const keysDirectory = path.resolve("keys")
const connFile = path.resolve(keysDirectory, "connection.json")
const crtFile = path.resolve(keysDirectory, "kyma.crt")
const privateKeyFile = path.resolve(keysDirectory, "app.key")

var privateKeyData: string;
var certificateData: string;
var connection: Info | null = null;

export function init() {
    if (!fs.existsSync(keysDirectory)) {
        fs.mkdirSync(keysDirectory)
    }

    if (fs.existsSync(privateKeyFile)) {
        privateKeyData = fs.readFileSync(privateKeyFile, "utf-8")
        LOGGER.info("Found existing private key: %s", privateKeyFile)
    } else {
        privateKeyData = generatePrivateKey(privateKeyFile)
    }

    if (fs.existsSync(connFile)) {
        connection = JSON.parse(fs.readFileSync(connFile, "utf-8"))
        LOGGER.info("Found existing connection info: %s", connFile)
    }

    if (fs.existsSync(crtFile)) {
        certificateData = fs.readFileSync(crtFile, "utf-8")
        LOGGER.info("Found existing certificate: %s", crtFile)
    }
}

function establish(newConnection: Info, newCertificate: string, persistFiles: boolean) {
    connection = newConnection
    certificateData = newCertificate

    if (persistFiles) {
        fs.writeFileSync(connFile, JSON.stringify(connection, null, 2), { encoding: "utf8", flag: 'wx' })
        fs.writeFileSync(crtFile, certificateData, { encoding: "utf8", flag: 'wx' })
    }

    LOGGER.info("Connected to %s", connection.domain)

    return connection
}

export function certificate(): string {
    if (!established()) {
        throw new Error("Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status")
    }
    return certificateData
}

export function privateKey(): string {
    return privateKeyData
}

export function established(): boolean {
    return connection != null
}

function generatePrivateKey(filePath: string): string {
    LOGGER.debug("Generating new private key: %s", filePath)
    let keys = forge.pki.rsa.generateKeyPair(2048)
    const key = forge.pki.privateKeyToPem(keys.privateKey)
    fs.writeFileSync(filePath, key)
    LOGGER.info("Generated new private key: %s", filePath)
    return key
}

export function info(): Info {
    if (!established()) {
        throw new Error("Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status")
    }
    return connection!;
}

export function destroy(): void {
    connection = null

    if (fs.existsSync(connFile)) {
        fs.unlinkSync(connFile)
    }
    if (fs.existsSync(crtFile)) {
        fs.unlinkSync(crtFile)
    }
}

export async function connect(token: string, persistFiles: boolean = true, insecure: boolean = false): Promise<Info> {
    if (!token) {
        throw new Error("A token is required to establish a connection")
    }

    if (token.startsWith("http://") || token.startsWith("https://")) {
        return kymaConnector.connect(token, insecure).then(result => {
            return establish(result.connection, result.certificate, persistFiles)
        })
    }
    return compassConnector.connect(token, insecure).then(result => {
        return establish(result.connection, result.certificate, persistFiles)
    })
}

export async function eventsUrl(): Promise<string> {
    let result = connection!.eventsUrl;
    if (result) {
        return result
    }
    return compassConnector.eventsUrl(connection!.domain, connection!.application);
}

export type Info = {
    insecure: boolean,
    metadataUrl: string,
    eventsUrl: string | null,
    renewCertUrl: string | null,
    revocationCertUrl: string | null,
    consoleUrl: string,
    applicationUrl: string,
    domain: string,
    application: string
    type: Type
}

export enum Type {
    Kyma = "Kyma",
    Compass = "Compass"
}