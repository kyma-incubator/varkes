#!/usr/bin/env node
import { CONFIG } from "../config"
import path = require("path")
import request = require("request")
import { LOGGER } from "../logger"
import fs = require("fs");
import { Router, Response, Request } from "express"
var apiRouter = Router()

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

function getAll(req: Request, res: Response) {
    LOGGER.debug("Getting all APIs")
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request({
            url: CONFIG.URLs.metadataUrl,
            method: "GET",
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting all APIs: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting all API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data")
                res.status(200).type("json").send(body)
            }
        })
    }
};
function createAPI(localKyma: boolean, serviceMetadata: any, cb: Function) {
    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });

}
function create(req: Request, res: Response) {
    LOGGER.debug("Creating API %s", req.body.name)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        createAPI(req.query.localKyma, req.body, function (error: Error, httpResponse: Response, body: any) {
            if (error) {
                LOGGER.error("Error while creating API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while creating API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};

function get(req: Request, res: Response) {
    LOGGER.debug("Get API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.get({
            url: `${CONFIG.URLs.metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(200).type("json").send(body)
            }
        })
    }
};

function update(req: Request, res: Response) {
    LOGGER.debug("Update API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.put({
            url: `${CONFIG.URLs.metadataUrl}/${req.params.api}`,
            headers: {
                "Content-Type": "application/json"
            },
            json: req.body,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while updating API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while updating API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(200).type("json").send(body)
            }
        });
    }
};

function deleteApi(req: Request, res: Response) {
    LOGGER.debug("Delete API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.delete({
            url: `${CONFIG.URLs.metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while deleting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while deleting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(200).type("json").send(body)
            }
        })
    }
}

function assureConnected() {
    if (CONFIG.URLs.metadataUrl == "") {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}

apiRouter.get("/", getAll)
apiRouter.post("/", create)

apiRouter.get("/:api", get)
apiRouter.put("/:api", update)
apiRouter.delete("/:api", deleteApi)

export { apiRouter, createAPI }
