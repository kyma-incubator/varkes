import { logger as LOGGER } from "./logger";
import * as request from "request-promise";
const forge = require("node-forge");
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const keysDirectory = path.resolve("keys")
const connFile = path.resolve(keysDirectory, "connection.json")
const crtFile = path.resolve(keysDirectory, "kyma.crt")
const privateKeyFile = path.resolve(keysDirectory, "app.key")
const KEY_URL = "/key";
const CERT_URL = "/cert";
var privateKeyData: any;
var certificateData: any;
var connection: any;

function init() {
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
async function callTokenUrl(insecure: any, url: any) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
    }).then((response: any) => {
        if (response.statusCode !== 200) {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("Token URL returned %s", JSON.stringify(response.body, null, 2))
        return response.body
    })
}

async function callCSRUrl(csrUrl: any, csr: any, insecure: any) {
    LOGGER.debug("Calling csr URL '%s'", csrUrl)
    var csrData = forge.util.encode64(csr)

    return request.post({
        uri: csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
    }).then((response: any) => {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("CSR URL returned")
        return Buffer.from(response.body.crt, 'base64').toString("ascii")
    })
}

async function callInfoUrl(infoUrl: any, crt: any, privateKey: any, insecure: any) {
    LOGGER.debug("Calling info URL '%s'", infoUrl)

    return request.get({
        uri: infoUrl,
        json: true,
        agentOptions: {
            cert: crt,
            key: privateKey
        },
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
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
    var pk = forge.pki.privateKeyFromPem(privateKey())
    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest()
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    LOGGER.debug("Created csr using subject %s", subject)
    return forge.pki.certificationRequestToPem(csr)
}

function parseSubjectToJsonArray(subject: any) {
    var subjectsArray: any = []
    subject.split(",").map((el: any) => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray;
}

function certificate() {
    if (!established()) {
        throw new Error("Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status")
    }
    return certificateData
}

function privateKey() {
    return privateKeyData
}

function established() {
    return connection && connection.metadataUrl
}

function generatePrivateKey(filePath: any) {
    LOGGER.debug("Generating new function key: %s", filePath)
    var keys = forge.pki.rsa.generateKeyPair(2048)
    const key = forge.pki.privateKeyToPem(keys.privateKey)
    fs.writeFileSync(filePath, key)
    LOGGER.info("Generated new function key: %s", filePath)
    return key
}

function info() {
    return connection;
}

async function connect(tokenUrl: string, persistFiles: boolean = true, insecure: boolean = false) {
    try {
        var insecure = insecure ? true : false

        var tokenResponse = await callTokenUrl(insecure, tokenUrl)
        var csr = generateCSR(tokenResponse.certificate.subject)
        certificateData = await callCSRUrl(tokenResponse.csrUrl, csr, insecure)
        var infoResponse = await callInfoUrl(tokenResponse.api.infoUrl, certificateData, privateKeyData, insecure)

        var domains = new url.URL(infoResponse.urls.metadataUrl).hostname.replace("gateway.", "");
        var connectionData: any = {
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
            application: infoResponse.clientIdentity.application,
            key: KEY_URL,
            cert: CERT_URL
        }

        if (persistFiles) {
            fs.writeFileSync(connFile, JSON.stringify(connectionData, null, 2), { encoding: "utf8", flag: 'wx' })
            fs.writeFileSync(crtFile, certificateData, { encoding: "utf8", flag: 'wx' })
        }
        connection = connectionData;
        LOGGER.info("Connected to %s", connectionData.domain)
        return connectionData;

    } catch (error) {
        // var message = "There is an error while establishing the connection. Usually that is caused by an invalid or expired token URL."
        // LOGGER.error("Failed to connect to kyma cluster: %s", error)
        // throw new Error(message);
        throw error;
    }
}
function destroy() {
    connection = null

    if (fs.existsSync(connFile)) {
        fs.unlinkSync(connFile)
    }
    if (fs.existsSync(crtFile)) {
        fs.unlinkSync(crtFile)
    }
}
export { connect, info, privateKey, certificate, established, init, destroy, KEY_URL, CERT_URL }
