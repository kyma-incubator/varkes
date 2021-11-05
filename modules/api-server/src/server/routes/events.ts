#!/usr/bin/env node
'use strict'

import * as express from "express"
import * as config from "@varkes/configuration"
const LOGGER = config.logger("api-server")
import { event, connection } from "@varkes/app-connector"

function sendEvent(req: express.Request, res: express.Response) {
    LOGGER.debug("Received event header: %s, and body: %s", JSON.stringify(req.headers, null, 2), JSON.stringify(req.body, null, 2))
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        if (req.get('ce-specversion')) {
            event.sendCloudEventBinary(req.body, req.headers).then((result: any) => {
                res.status(200).send(result);
            }, (err: any) => {
                LOGGER.error("Failed to send cloud event in binary mode: %s", err)
                res.status(500).send({ error: err.message });
            })
        } else if (req.get('content-type')==='application/json') {
            event.sendLegacyEvent(req.body).then((result: any) => {
                res.status(200).send(result);
            }, (err: any) => {
                LOGGER.error("Failed to send legacy event: %s", err)
                res.status(500).send({ error: err.message });
            })
        } else if (req.get('content-type')==='application/cloudevents+json') {
            event.sendCloudEvent(req.body).then((result: any) => {
                res.status(200).send(result);
            }, (err: any) => {
                LOGGER.error("Failed to send cloud event: %s", err)
                res.status(500).send({ error: err.message });
            }) 
        }
    }
}


function router() {
    let eventsRouter = express.Router()
    eventsRouter.post("/", sendEvent)
    return eventsRouter
}

function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}

export { router }