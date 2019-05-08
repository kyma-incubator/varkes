#!/usr/bin/env node
'use strict'

const LOGGER = require("../logger").logger
const express = require("express")
var { api, event, connection } = require("@varkes/app-connector")
var nodePort;
module.exports = {
    router: router
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
        res.status(404).send({ error: err })
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

async function connect(req, res) {
    try {
        await connection.connect(req.body.url, true, req.body.insecure, nodePort)
        LOGGER.info("Connected to %s", connection.info().domain)
        res.status(200).send(connection.info())

    } catch (error) {
        var message = "There is an error while establishing the connection. Usually that is caused by an invalid or expired token URL."
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.status(401).send({ error: message })
        return
    }

}

function router(nodePortParam = null) {
    nodePort = nodePortParam
    console.log("connection " + JSON.stringify(connection));
    var connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get(connection.KEY_URL, key)
    connectionRouter.get(connection.CERT_URL, cert)
    connectionRouter.post("/", connect)

    return connectionRouter
}