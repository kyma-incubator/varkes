#!/usr/bin/env node
'use strict'

const express = require('express')
const LOGGER = require("../logger").logger
const fs = require("fs")
const connection = require("../connection")
const apis = require("./apis");
const request = require("request")
const yaml = require('js-yaml');

module.exports = {
    router: router,
    createEventsFromConfig: createEventsFromConfig
}

function sendEvent(req, res) {
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
                    LOGGER.error("Error while Sending Event: %s", JSON.stringify(body))
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
                else {
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            }
        })
    }
}

async function createEventsFromConfig(eventsConfig, registeredApis) {
    if (!eventsConfig)
        return

    var eventMetadata = defineEventMetadata()
    var error_message = ""
    for (var i = 0; i < eventsConfig.length; i++) {
        var event = eventsConfig[i];
        try {
            var reg_api;
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == event.name);
            if (!reg_api) {
                LOGGER.debug("Registered Event API successful: %s", event.name)
                await createEvent(eventMetadata, event)
            }
            else {
                LOGGER.debug("Updated Event API successful: %s", event.name)
                await updateEvent(eventMetadata, event, reg_api.id)
            }

        } catch (error) {
            var message = "Registration of Event API " + event.name + " failed: " + JSON.stringify(error)
            LOGGER.error(message)
            error_message += "\n" + message
        }
    }
    if (error_message != "") {
        throw new Error(error_message);
    }
}

function createEvent(eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        eventMetadata = fillEventData(eventMetadata, event);
        apis.createAPI(eventMetadata, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        })

    })
}
async function updateEvent(eventMetadata, event, event_id) {
    LOGGER.debug("Auto-update Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        eventMetadata = fillEventData(eventMetadata, event)
        apis.updateAPI(eventMetadata, event_id, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        })
    })
}
function fillEventData(eventMetadata, event) {
    eventMetadata.name = event.name;
    if (event.description) {
        eventMetadata.description = event.description;
    }
    else {
        eventMetadata.description = event.name;
    }
    if (event.labels) {
        eventMetadata.labels = event.labels;
    }

    if (event.provider) {
        eventMetadata.provider = event.provider;
    }

    var specInJson
    if (event.specification.endsWith(".json")) {
        specInJson = JSON.parse(fs.readFileSync(event.specification))
    } else {
        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'));
    }

    eventMetadata.events.spec = specInJson;
    return eventMetadata
}
function defineEventMetadata() {
    return {
        "provider": "Varkes",
        "name": "",
        "description": "",
        "labels": {},
        "events": {
            "spec": {}
        }
    }
}

function router() {
    var eventsRouter = express.Router()
    eventsRouter.post("/", sendEvent)
    return eventsRouter;
}

function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}