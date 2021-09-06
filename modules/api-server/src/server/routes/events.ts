#!/usr/bin/env node
'use strict'

import * as express from "express"
import * as config from "@varkes/configuration"
const LOGGER = config.logger("api-server")
import { event, connection } from "@varkes/app-connector"

function sendEvent(req: express.Request, res: express.Response) {
    LOGGER.debug("Sending event %s", JSON.stringify(req.body, null, 2))
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        event.send(req.body).then((result: any) => {
            res.status(200).send(result);
        }, (err: any) => {
            LOGGER.error("Failed to send event: %s", err)
            res.status(500).send({ error: err.message });
        })
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