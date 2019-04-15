#!/usr/bin/env node
'use strict'

const express = require('express')
const LOGGER = require("../logger").logger
const connection = require("../connection")
const request = require("request")
module.exports = {
    router: router
}

function sendEvent(req, res) {
    LOGGER.debug("Sending event %s", JSON.stringify(req.body, null, 2))
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.post({
            url: connection.info().eventsUrl,
            headers: {
                "Content-Type": "application/json"
            },
            json: req.body,
            agentOptions: {
                cert: connection.certificate(),
                key: connection.privateKey()
            },
            rejectUnauthorized: connection.secure()
        }, (error, httpResponse, body) => {
            if (error) {
                LOGGER.error("Error while Sending Event: %s", error)
                res.status(500).send({ error: error.message })
            } else {
                if (httpResponse.statusCode >= 400) {
                    LOGGER.error("Error while Sending Event: %s", JSON.stringify(body, null, 2))
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
                else {
                    LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            }
        })
    }
}

function router() {
    var eventsRouter = express.Router()
    eventsRouter.post("/", sendEvent)
    return eventsRouter
}

function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}