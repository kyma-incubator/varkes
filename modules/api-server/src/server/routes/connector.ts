#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import * as express from "express"
import { connection } from "@varkes/app-connector"

const LOGGER = config.logger("api-server")

function disconnect(req: express.Request, res: express.Response) {
    try {
        connection.destroy()
    } catch (error) {
        LOGGER.error("Failed to disconnect from kyma cluster: %s", error)
        res.status(500).send({ error: "There was an internal error while resetting the connection" })
        return
    }
    res.status(204).send()
}

function info(req: express.Request, res: express.Response) {
    let err = assureConnected()
    if (err) {
        res.status(404).send({ error: err })
    } else {
        res.status(200).send(connection.info())
    }
}

function key(req: express.Request, res: express.Response) {
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        res.contentType('application/octet-stream')
        res.header('Content-disposition', 'inline; filename=app.key')
        res.status(200)
        res.send(connection.privateKey())
    }
}

function cert(req: express.Request, res: express.Response) {
    let err = assureConnected()
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

async function connect(req: express.Request, res: express.Response) {
    try {
        await connection.connect(req.body.url, true, req.body.insecure)
        LOGGER.info("Connected to %s", connection.info()!.domain)
        res.status(200).send(connection.info())
    } catch (error) {
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.status(500).send({ error: error.message });
    }
}

function router() {
    let connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get("/key", key)
    connectionRouter.get("/cert", cert)
    connectionRouter.post("/", connect)

    return connectionRouter
}
export { router }