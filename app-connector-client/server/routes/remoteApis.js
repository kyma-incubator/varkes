#!/usr/bin/env node
'use strict'

const connection = require("../connection")
const request = require("request")
const LOGGER = require("../logger").logger
const express = require("express")
const openapiSampler = require('openapi-sampler');
const refParser = require('json-schema-ref-parser');
const services = require("../services")
module.exports = {
    router: router
}

function getAll(req, res) {
    LOGGER.debug("Getting all APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        services.getAllAPIs(function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting all APIs: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting all API: %s", JSON.stringify(body, null, 2))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received all API data")
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
}






function get(req, res) {
    LOGGER.debug("Get API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.get({
            url: `${connection.info().metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: connection.certificate(),
                key: connection.privateKey()
            },
            rejectUnauthorized: connection.secure()
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting API: %s", JSON.stringify(body, null, 2))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data")
                body = JSON.parse(body)
                body.id = req.params.api //comply with the api spec
                if (body.events && body.events.spec && Object.keys(body.events.spec).length !== 0) { //an empty events.spec {} causes bug
                    refParser.dereference(body.events.spec)
                        .then(function (schema) {
                            Object.keys(schema.topics).forEach((topicKey) => {
                                if (schema.topics[topicKey].publish) {
                                    schema.topics[topicKey].example = openapiSampler.sample(schema.topics[topicKey].publish.payload)
                                }
                                else {
                                    schema.topics[topicKey].example = openapiSampler.sample(schema.topics[topicKey].subscribe.payload)
                                }
                            })
                            body.events.spec = schema
                            res.status(httpResponse.statusCode).type("json").send(body)
                        })
                        .catch(function (err) {
                            LOGGER.error("Error while getting API: %s", err)
                            res.status(500).send({ error: err.message })
                        })
                }
                else {
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            }
        })
    }
}

function update(req, res) {
    LOGGER.debug("Update API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        services.updateAPI(req.body, req.params.api,
            function (error, httpResponse, body) {
                if (error) {
                    LOGGER.error("Error while updating API: %s", error)
                    res.status(500).send({ error: error.message })
                } else if (httpResponse.statusCode >= 400) {
                    LOGGER.error("Error while updating API: %s", JSON.stringify(body, null, 2))
                    res.status(httpResponse.statusCode).type("json").send(body)
                } else {
                    LOGGER.debug("Received API data")
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            })
    }
}

function deleteApi(req, res) {
    LOGGER.debug("Delete API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.delete({
            url: `${connection.info().metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: connection.certificate(),
                key: connection.privateKey()
            },
            rejectUnauthorized: connection.secure()
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while deleting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while deleting API: %s", JSON.stringify(body, null, 2))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data")
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
}
function create(req, res) {
    LOGGER.debug("Creating API %s", req.body.name)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        services.createAPI(req.body, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while creating API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while creating API: %s", JSON.stringify(body, null, 2))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received create API data")
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
}
function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}

function router() {
    var apiRouter = express.Router()

    apiRouter.get("/", getAll)
    apiRouter.post("/", create)
    apiRouter.get("/:api", get)
    apiRouter.put("/:api", update)
    apiRouter.delete("/:api", deleteApi)

    return apiRouter
}