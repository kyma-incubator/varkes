import { LOGGER } from "../logger"

import * as request from "request"

import { CONFIG } from "../config"

import * as path from "path"
import * as fs from "fs"

import { createAPI } from "./apis"
let localKyma = CONFIG.localKyma

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

function sendEvent(req: any, res: any) {
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
        rejectUnauthorized: !localKyma
    }, (error: any, httpResponse: any, body: any) => {
        res.send(body)
    })
}

async function createEventsFromConfig(eventsConfig: any) {
    if (!eventsConfig)
        return

    let eventMetadata = defineEventMetadata()
    for (let i = 0; i < eventsConfig.length; i++) {
        let event = eventsConfig[i]
        try {
            await createEvent(eventMetadata, event)
            LOGGER.debug("Registered Event API successful: %s", event.name)
        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
        }
    }
}

function createEvent(eventMetadata: any, event: any) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
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

        let serviceJSON = JSON.parse(fs.readFileSync(event.specification_file).toString())
        eventMetadata.events = serviceJSON;

        createAPI(localKyma, eventMetadata, function (data: any, err: any) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function defineEventMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "",
        "description": "",
        "labels": {
            "connected-app": "myApp"
        },
        "events": {
        }
    }
}

export { sendEvent, createEventsFromConfig }
