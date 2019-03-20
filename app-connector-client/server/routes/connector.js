#!/usr/bin/env node
'use strict'

const request = require("request-promise")
const fs = require("fs")
const LOGGER = require("../logger").logger
const forge = require("node-forge")
const url = require("url")
const services = require("./services")
const events = require("./events")
const express = require("express")
const connection = require("../connection")

var nodePort;
var varkesConfig;

module.exports = {
    router: router
}

function callTokenUrl(insecure, url) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 200) {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body) + "'")
        }
        LOGGER.debug("Token URL returned '%s'", response.body)
        var result = JSON.parse(response.body)
        result.insecure = insecure
        return result
    })
}

function generateCSRFromResponse(tokenResponse) {
    return new Promise(function (resolve, reject) {
        tokenResponse.csr = generateCSR(tokenResponse.certificate.subject)
        resolve(tokenResponse)
    })
}

function callCSRUrl(tokenResponse) {
    LOGGER.debug("Calling csr URL '%s'", tokenResponse.csrUrl)
    var csrData = forge.util.encode64(tokenResponse.csr)

    return request.post({
        uri: tokenResponse.csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !tokenResponse.insecure,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body) + "'")
        }
        LOGGER.debug("CSR URL returned")
        tokenResponse.crt = (Buffer.from(response.body.crt, 'base64').toString("ascii"))
        return tokenResponse
    })
}

function disconnect(req, res) {
    try {
        connection.destroy()
    } catch (error) {
        res.status(500).send({ error: "There was an internal error while resetting the connection" })
        return
    }
    res.status(204).send()
}

function info(req, res) {
    if (connection.isEstablished()) {
        res.status(200).send(createInfo())
    } else {
        res.status(400).send({ error: "Not connected to a Kyma cluster" })
    }
}

function key(req, res) {
    if (fs.existsSync(connection.privateKey())) {
        res.download(connection.privateKey())
    } else {
        res.status(400).send({ error: "Not connected to a Kyma cluster" })
    }
}

function cert(req, res) {
    if (fs.existsSync(connection.info().certificate)) {
        res.download(connection.info().certificate)
    } else {
        res.status(400).send({ error: "Not connected to a Kyma cluster" })
    }
}

function createInfo() {
    var connectionData = connection.info()
    const myURL = new url.URL(connectionData.metadataUrl)
    var domains = myURL.hostname.split(".")
    const app = myURL.pathname.split("/")[1]
    return {
        domain: domains[1] ? domains[1] : domains[0],
        app: app,
        consoleUrl: connectionData.metadataUrl.replace("gateway", "console").replace(app + "/v1/metadata/services", "home/cmf-apps/details/" + app),
        eventsUrl: connectionData.eventsUrl,
        metadataUrl: connectionData.metadataUrl
    }
}

function generateCSR(subject) {
    LOGGER.debug("Creating CSR using subject %s", subject)
    var privateKey = fs.readFileSync(connection.privateKey(), 'utf8')
    var pk = forge.pki.privateKeyFromPem(privateKey)
    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest();
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    LOGGER.debug("Created csr using subject %s", subject)
    return forge.pki.certificationRequestToPem(csr)

}

function parseSubjectToJsonArray(subject) {
    var subjectsArray = []
    subject.split(",").map(el => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray
}

async function connect(req, res) {
    if (!req.body) res.status(400).send({ error: "No connection details provided" })

    try {
        var insecure = req.body.insecure ? true : false
        var tokenResponse = await callTokenUrl(insecure, req.body.url)
            .then(generateCSRFromResponse)
            .then(callCSRUrl)

        var connectionData = {
            insecure: insecure,
            metadataUrl: tokenResponse.api.metadataUrl,
            eventsUrl: tokenResponse.api.eventsUrl,
            certificatesUrl: tokenResponse.api.certificatesUrl
        }

        if (connectionData.insecure && nodePort) {
            var result = connectionData.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            connectionData.metadataUrl = connectionData.metadataUrl.replace(result[0], result[0] + ":" + nodePort);
        }

        connection.establish(connectionData, tokenResponse.crt)

        if (req.body.register) {
            LOGGER.debug("Auto-registering APIs")
            var hostname = req.body.hostname || "http://localhost"
            var registeredAPIs = await services.getAllAPI()
            var promises = [
                services.createServicesFromConfig(hostname, varkesConfig.apis, registeredAPIs),
                events.createEventsFromConfig(varkesConfig.events, registeredAPIs)
            ]
            await Promise.all(promises);
            LOGGER.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        }
        info = createInfo()
        LOGGER.info("Connected to %s", info.domain)

        res.status(200).send(info)
    } catch (error) {
        var message = "There is an error while registering. Please make sure that your token is unique"
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.status(401).send({ error: message })
    }
}

function router(config, nodePortParam = null) {
    varkesConfig = config;
    nodePort = nodePortParam;

    var connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get("/key", key)
    connectionRouter.get("/cert", cert)
    connectionRouter.post("/", connect)

    return connectionRouter;
}