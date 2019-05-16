#!/usr/bin/env node
'use strict'

import * as express from "express"
import { logger as LOGGER } from "../logger"
import { event, connection } from "@varkes/app-connector"

function sendEvent(req: any, res: any) {
    LOGGER.debug("Sending event %s", JSON.stringify(req.body, null, 2))
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        event.sendEvent(req.body).then((result: any) => {
            res.status(200).send(result);
        }, (err: any) => {
            res.status(err.statusCode).send(err.message);
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