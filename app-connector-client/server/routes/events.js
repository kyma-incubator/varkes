#!/usr/bin/env node
'use strict'

const express = require('express')
const LOGGER = require("../logger").logger
const fs = require("fs")
const path = require("path")
const CONFIG = require("../config.json")
const apis = require("./apis");
const request = require("request")
const yaml = require('js-yaml');

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

module.exports = {
    router: router,
    createEventsFromConfig: createEventsFromConfig
}

function sendEvent(req, res) {
    request.post({
        url: CONFIG.URLs.eventsUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: req.body,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !req.params.localKyma
    }, (error, httpResponse, body) => {
        res.send(body)
    })
}

async function createEventsFromConfig(localKyma, eventsConfig, registeredApis) {
    if (!eventsConfig)
        return

    eventMetadata = defineEventMetadata()
    for (i = 0; i < eventsConfig.length; i++) {
        event = eventsConfig[i];

        try {
            var reg_api;
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == event.name);
            if (!reg_api) {
                LOGGER.debug("Registered Event API successful: %s", event.name)
                await createEvent(localKyma, eventMetadata, event)
            }
            else {
                LOGGER.debug("Updated Event API successful: %s", event.name)
                await updateEvent(localKyma, eventMetadata, event, reg_api.id)
            }

        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
            throw error
        }
    }
}

async function createEvent(localKyma, eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        eventMetadata = fillEventData(eventMetadata, event);
        apis.createAPI(localKyma, eventMetadata, function (err, httpResponse, body) {
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
async function updateEvent(localKyma, eventMetadata, event, event_id) {
    LOGGER.debug("Auto-update Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        eventMetadata = fillEventData(eventMetadata, event)
        apis.updateAPI(localKyma, eventMetadata, event_id, function (err, httpResponse, body) {
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
    if (eventMetadata.description) {
        eventMetadata.description = event.description;
    }
    else {
        eventMetadata.description = event.name;
    }
    if (eventMetadata.labels) {
        eventMetadata.labels = event.labels;
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
        "provider": "SAP Hybris",
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

