#!/usr/bin/env node
'use strict'

const request = require("request-promise")
const LOGGER = require("../logger").logger
const forge = require("node-forge")
const url = require("url")
const express = require("express")
const connection = require("../connection")

var nodePort;
var varkesConfig
module.exports = {
    router: router
}

function callTokenUrl(insecure, url) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 200) {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("Token URL returned %s", JSON.stringify(response.body, null, 2))
        return response.body
    })
}

function callCSRUrl(csrUrl, csr, insecure) {
    LOGGER.debug("Calling csr URL '%s'", csrUrl)
    var csrData = forge.util.encode64(csr)

    return request.post({
        uri: csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true
    }).then(function (response) {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("CSR URL returned")
        return Buffer.from(response.body.crt, 'base64').toString("ascii")
    })
}

function callInfoUrl(infoUrl, crt, privateKey, insecure) {
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
    }).then(function (response) {
        if (response.statusCode !== 200) {
            throw new Error("Calling Info URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("Got following Info URL returned: %s", JSON.stringify(response.body, null, 2))
        return response.body
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
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        res.status(200).send(connection.info())
    }
}

function key(req, res) {
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        res.contentType('application/octet-stream')
        res.header('Content-disposition', 'inline; filename=app.key')
        res.status(200)
        res.send(connection.privateKey())
    }
}

function cert(req, res) {
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        res.contentType('application/x-x509-ca-cert')
        res.header('Content-disposition', 'inline; filename=kyma.crt')
        res.status(200)
        res.send(connection.certificate())
    }
}

function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}

function generateCSR(subject) {
    LOGGER.debug("Creating CSR using subject %s", subject)
    var pk = forge.pki.privateKeyFromPem(connection.privateKey())
    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest()
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
        var csr = generateCSR(tokenResponse.certificate.subject)
        var crt = await callCSRUrl(tokenResponse.csrUrl, csr, insecure)
        var infoResponse = await callInfoUrl(tokenResponse.api.infoUrl, crt, connection.privateKey(), insecure)

        var domains = new url.URL(infoResponse.urls.metadataUrl).hostname.split(".")
        var connectionData = {
            insecure: insecure,
            infoUrl: tokenResponse.api.infoUrl,
            metadataUrl: infoResponse.urls.metadataUrl,
            eventsUrl: infoResponse.urls.eventsUrl,
            certificatesUrl: infoResponse.urls.certificatesUrl,
            renewCertUrl: infoResponse.urls.renewCertUrl,
            revocationCertUrl: infoResponse.urls.revocationCertUrl,
            consoleUrl: infoResponse.urls.metadataUrl.replace("gateway", "console").replace(infoResponse.clientIdentity.application + "/v1/metadata/services", "home/cmf-apps/details/" + infoResponse.clientIdentity.application),
            domain: domains[1] ? domains[1] : domains[0],
            application: infoResponse.clientIdentity.application
        }

        if (connectionData.insecure && nodePort) {
            var result = connectionData.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/)
            connectionData.metadataUrl = connectionData.metadataUrl.replace(result[0], result[0] + ":" + nodePort)
        }

        connection.establish(connectionData, crt)

        LOGGER.info("Connected to %s", connection.info().domain)
        res.status(200).send(connection.info())

    } catch (error) {
        var message = "There is an error while establishing the connection. Usually that is caused by an invalid or expired token URL."
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.status(401).send({ error: message })
        return
    }

}

function router(config, nodePortParam = null) {
    varkesConfig = config
    nodePort = nodePortParam

    var connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get("/key", key)
    connectionRouter.get("/cert", cert)
    connectionRouter.post("/", connect)

    return connectionRouter
}