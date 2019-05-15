#!/usr/bin/env node
'use strict'

import { logger as LOGGER } from "../logger"
import * as express from "express"
import { connection } from "@varkes/app-connector"

function disconnect(req: any, res: any) {
    try {
        connection.destroy()
    } catch (error) {
        res.status(500).send({ error: "There was an internal error while resetting the connection" })
        return
    }
    res.status(204).send()
}

function info(req: any, res: any) {
    var err = assureConnected()
    if (err) {
        res.status(404).send({ error: err })
    } else {
        res.status(200).send(connection.info())
    }
}

function key(req: any, res: any) {
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        res.contentType('application/octet-stream')
        res.header('Content-disposition', 'inline; filename=app.key')
        res.status(200)
        res.send(connection.privateKey())
    }
}

function cert(req: any, res: any) {
    var err = assureConnected()
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

async function connect(req: any, res: any) {
    try {
        await connection.connect(req.body.url, true, req.body.insecure)
        LOGGER.info("Connected to %s", connection.info().domain)
        res.status(200).send(connection.info())

    } catch (error) {

        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        if (!error.statusCode) {

            res.status(500).send(error.message);
        }
        else {
            if (error.statusCode == 403) {
                var message = "Error: Invalid Token, Please use another Token"
                res.status(error.statusCode).send(message);
            }
            else {
                res.status(error.statusCode).send(error.message);
            }
        }
    }

}

function router() {
    var connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get(connection.KEY_URL, key)
    connectionRouter.get(connection.CERT_URL, cert)
    connectionRouter.post("/", connect)

    return connectionRouter
}
export { router }