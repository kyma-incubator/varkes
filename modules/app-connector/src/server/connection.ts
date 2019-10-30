#!/usr/bin/env node
'use strict'

import * as request from "request-promise";
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as config from "@varkes/configuration"

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

async function callTokenUrl(insecure: boolean, url: string) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Token URL returned %s", JSON.stringify(response.body, null, 2))
            return response.body
        } else if (response.statusCode == 403) {
            LOGGER.debug("Token URL returned failed with status 403: %s", JSON.stringify(response.body, null, 2))
            throw new Error("The token is invalid, please fetch a new token")
        } else {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
    })
}

async function callCSRUrl(csrUrl: string, csr: any, insecure: boolean) {
    LOGGER.debug("Calling csr URL '%s'", csrUrl)
    let csrData = forge.util.encode64(csr)

    return request.post({
        uri: csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("CSR URL returned")
        return Buffer.from(response.body.crt, 'base64').toString("ascii")
    })
}

async function callInfoUrl(infoUrl: string, crt: any, privateKey: string, insecure: boolean) {
    LOGGER.debug("Calling info URL '%s'", infoUrl)

    return request.get({
        uri: infoUrl,
        json: true,
        agentOptions: {
            cert: crt,
            key: privateKey
        },
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode !== 200) {
            throw new Error("Calling Info URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("Got following Info URL returned: %s", JSON.stringify(response.body, null, 2))
        return response.body
    })
}
function generateCSR(subject: any) {
    LOGGER.debug("Creating CSR using subject %s", subject)
    let pk = forge.pki.privateKeyFromPem(privateKey())
    let publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    let csr = forge.pki.createCertificationRequest()
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    LOGGER.debug("Created csr using subject %s", subject)
    return forge.pki.certificationRequestToPem(csr)
}

function parseSubjectToJsonArray(subject: any) {
    let subjectsArray: any = []
    subject.split(",").map((el: any) => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray;
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

export async function connect(tokenUrl: string, persistFiles: boolean = true, insecure: boolean = false): Promise<Info> {
    let tokenResponse = await callTokenUrl(insecure, tokenUrl)
    let csr = generateCSR(tokenResponse.certificate.subject)
    certificateData = await callCSRUrl(tokenResponse.csrUrl, csr, insecure)
    let infoResponse = await callInfoUrl(tokenResponse.api.infoUrl, certificateData, privateKeyData, insecure)

    let domains = new url.URL(infoResponse.urls.metadataUrl).hostname.replace("gateway.", "");
    let connectionData: Info = {
        insecure: insecure,
        infoUrl: tokenResponse.api.infoUrl,
        metadataUrl: infoResponse.urls.metadataUrl,
        eventsUrl: infoResponse.urls.eventsUrl,
        certificatesUrl: infoResponse.urls.certificatesUrl,
        renewCertUrl: infoResponse.urls.renewCertUrl,
        revocationCertUrl: infoResponse.urls.revocationCertUrl,
        consoleUrl: infoResponse.urls.metadataUrl.replace("gateway", "console").replace(infoResponse.clientIdentity.application + "/v1/metadata/services", ""),
        applicationUrl: infoResponse.urls.metadataUrl.replace("gateway", "console").replace(infoResponse.clientIdentity.application + "/v1/metadata/services", "home/cmf-apps/details/" + infoResponse.clientIdentity.application),
        domain: domains,
        application: infoResponse.clientIdentity.application
    }

    if (persistFiles) {
        fs.writeFileSync(connFile, JSON.stringify(connectionData, null, 2), { encoding: "utf8", flag: 'wx' })
        fs.writeFileSync(crtFile, certificateData, { encoding: "utf8", flag: 'wx' })
    }
    connection = connectionData;
    LOGGER.info("Connected to %s", connectionData.domain)
    return connectionData;
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

export type Info = {
    insecure: boolean,
    infoUrl: string,
    metadataUrl: string,
    eventsUrl: string,
    certificatesUrl: string,
    renewCertUrl: string,
    revocationCertUrl: string,
    consoleUrl: string,
    applicationUrl: string,
    domain: string,
    application: string
}