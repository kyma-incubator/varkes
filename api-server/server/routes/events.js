#!/usr/bin/env node
'use strict'

const express = require('express')
const LOGGER = require("../logger").logger
var { _, event, connection } = require("@varkes/app-connector")
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
        event.sendEvent(req.body).then((result) => {
            res.status(200).send(result);
        }, (err) => {
            res.status(err.statusCode).send(err.message);
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