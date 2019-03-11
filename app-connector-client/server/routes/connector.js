#!/usr/bin/env node
'use strict'

const request = require("request-promise")
const fs = require("fs")
const path = require("path")
const LOGGER = require("../logger").logger
const CONFIG = require("../config.json")
const forge = require("node-forge")
const url = require("url")
const services = require("./services")
const events = require("./events")
const express = require("express")

var nodePort;
var varkesConfig;

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
const keysDirectory = path.resolve(CONFIG.keyDir)

module.exports = {
    router: router
}

function callTokenUrl(localKyma, url) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        rejectUnauthorized: !localKyma,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 200) {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body) + "'")
        }
        LOGGER.debug("Token URL returned '%s'", response.body)
        var result = JSON.parse(response.body)
        result.localKyma = localKyma
        return result
    })
}

function generateCSRFromResponse(csrResponse) {
    return new Promise(function (resolve, reject) {
        generateCSR(csrResponse.certificate.subject)
        resolve(csrResponse)
    })
}

function callCSRUrl(csrResponse) {
    LOGGER.debug("Calling csr URL '%s'", csrResponse.csrUrl)
    var csrData = fs.readFileSync(`${keysDirectory}/${CONFIG.csrFile}`, "base64")

    return request.post({
        uri: csrResponse.csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !csrResponse.localKyma,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body) + "'")
        }
        LOGGER.debug("CSR URL returned '%s'", JSON.stringify(response.body))
        var CRT_base64_decoded = (Buffer.from(response.body.crt, 'base64').toString("ascii"))

        fs.writeFileSync(`${keysDirectory}/${CONFIG.crtFile}`, CRT_base64_decoded)
        LOGGER.debug("Wrote crt file to '%s'", `${keysDirectory}/${CONFIG.crtFile}`)
        return csrResponse.api
    })
}

function disconnect(req, res) {
    try {
        if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
            fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))
        }
        if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))) {
            fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))
        }
        if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))) {
            fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))
        }
        CONFIG.URLs = {
            metadataUrl: "",
            eventsUrl: "",
            certificatesUrl: ""
        }
    } catch (error) { //only triggger if there is an error with unlinkSync
        res.status(500).send({ error: "There was an internal error while deleting the files." })
        return //exit function
    }
    res.status(204).send() //means no error
}

function info(req, res) {
    info = createInfo(CONFIG.URLs)
    info ? res.status(200).send(info) : res.status(400).send({ error: "Not connected to a Kyma cluster" })
}

function key(req, res) {
    fs.existsSync(keyFile) ? res.download(keyFile) : res.status(400).send({ error: "Not connected to a Kyma cluster" })
}

function cert(req, res) {
    fs.existsSync(certFile) ? res.download(certFile) : res.status(400).send({ error: "Not connected to a Kyma cluster" })
}

function createInfo(api) {
    if (api.metadataUrl !== "") {
        const myURL = new url.URL(api.metadataUrl)
        var domains = myURL.hostname.split(".")
        return {
            domain: domains[1] ? domains[1] : domains[0],
            app: myURL.pathname.split("/")[1],
            consoleUrl: api.metadataUrl.replace("gateway", "console"),
            eventsUrl: api.eventsUrl,
            metadataUrl: api.metadataUrl
        }
    }
    return null
}

function generateCSR(subject) {
    LOGGER.debug("Creating CSR using subject %s", subject)
    var privateKey = fs.readFileSync(keyFile, 'utf8')
    var pk = forge.pki.privateKeyFromPem(privateKey)
    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest();
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    fs.writeFileSync(`${keysDirectory}/${CONFIG.csrFile}`, forge.pki.certificationRequestToPem(csr))
    LOGGER.debug("Wrote csr file to '%s'", `${keysDirectory}/${CONFIG.csrFile}`)
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
    if (!req.body) res.sendStatus(400);

    try {
        var data = await callTokenUrl(req.query.localKyma, req.body.url)
            .then(generateCSRFromResponse)
            .then(callCSRUrl)

        if (req.query.localKyma == true) {
            var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + nodePort);
        }

        CONFIG.URLs = data
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")
        LOGGER.debug("Wrote api file to '%s' using value '%s'", path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data))

        if (req.body.register) {
            LOGGER.debug("Auto-registering APIs")
            var hostname = req.body.hostname || "http://localhost"
            var registeredApis = await services.getAllAPI(req.query.localKyma);
            registeredApis = await services.createServicesFromConfig(req.query.localKyma, hostname, varkesConfig.apis, registeredApis)
            await events.createEventsFromConfig(req.query.localKyma, varkesConfig.events, registeredApis);
            LOGGER.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        }
        info = createInfo(data)
        LOGGER.info("Connected to %s", info.domain)

        if (info) {
            res.status(200).send(info)
        } else {
            res.status(400).send({ error: "Not connected to a Kyma cluster" })
        }

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