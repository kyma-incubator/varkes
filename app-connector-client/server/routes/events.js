#!/usr/bin/env node
'use strict'

const express = require('express')
const LOGGER = require("../logger").logger
const fs = require("fs")
const connection = require("../connection")
const apis = require("./apis")
const request = require("request")
const yaml = require('js-yaml')

module.exports = {
    router: router,
    createEventsFromConfig: createEventsFromConfig,
    fillEventData: fillEventData
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

async function createEventsFromConfig(eventsConfig, registeredApis) {
    if (!eventsConfig)
        return

    var error_message = ""
    for (var i = 0; i < eventsConfig.length; i++) {
        var event = eventsConfig[i]
        try {
            var reg_api
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == event.name)
            if (!reg_api) {
                LOGGER.debug("Registered Event API successful: %s", event.name)
                await createEvent(event)
            }
            else {
                LOGGER.debug("Updated Event API successful: %s", event.name)
                await updateEvent(event, reg_api.id)
            }
        } catch (error) {
            var message = "Registration of Event API " + event.name + " failed: " + JSON.stringify(error, null, 2)
            LOGGER.error(message)
            error_message += "\n" + message
        }
    }
    if (error_message != "") {
        throw new Error(error_message)
    }
}

function createEvent(event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        var eventData = fillEventData(event)
        apis.createAPI(eventData, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error)
                    reject(err)
                }
                resolve(body)
            }
        })

    })
}
async function updateEvent(event, event_id) {
    LOGGER.debug("Auto-update Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        var eventData = fillEventData(event)
        apis.updateAPI(eventData, event_id, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error)
                    reject(err)
                }
                resolve(body)
            }
        })
    })
}

function fillEventData(event) {
    var specInJson
    if (event.specification.endsWith(".json")) {
        specInJson = JSON.parse(fs.readFileSync(event.specification))
    } else {
        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'))
    }

    var serviceData = {
        provider: event.provider ? event.provider : "Varkes",
        name: event.name,
        description: event.description ? event.description : event.name,
        labels: event.labels ? event.labels : {},
        events: {
            spec: specInJson
        }
    }
    return serviceData
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