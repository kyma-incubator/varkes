#!/usr/bin/env node
'use strict'

const connection = require("../connection")
const request = require("request")
const LOGGER = require("../logger").logger
const fs = require("fs")
const express = require("express")
const openapiSampler = require('openapi-sampler');
const refParser = require('json-schema-ref-parser');

module.exports = {
    router: router,
    updateAPI: updateAPI,
    createAPI: createAPI,
    getAllAPIs: getAllAPIs
}

function getAll(req, res) {
    LOGGER.debug("Getting all APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        getAllAPIs(function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting all APIs: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting all API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received all API data")
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};

function getAllAPIs(cb) {
    request({
        url: connection.info().metadataUrl,
        method: "GET",
        agentOptions: {
            cert: fs.readFileSync(connection.info().certificate),
            key: fs.readFileSync(connection.privateKey())
        },
        rejectUnauthorized: !connection.info().insecure
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });
};

function createAPI(serviceMetadata, cb) {
    request.post({
        url: connection.info().metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(connection.info().certificate),
            key: fs.readFileSync(connection.privateKey())
        },
        rejectUnauthorized: !connection.info().insecure
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });
};

function updateAPI(serviceMetadata, api_id, cb) {
    request.put({
        url: `${connection.info().metadataUrl}/${api_id}`,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(connection.info().certificate),
            key: fs.readFileSync(connection.privateKey())
        },
        rejectUnauthorized: !connection.info().insecure
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });
};

function create(req, res) {
    LOGGER.debug("Creating API %s", req.body.name)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        createAPI(req.body, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while creating API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while creating API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received create API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};

function get(req, res) {
    LOGGER.debug("Get API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.get({
            url: `${connection.info().metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(connection.info().certificate),
                key: fs.readFileSync(connection.privateKey())
            },
            rejectUnauthorized: !connection.info().insecure
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
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
                            body.events.spec = schema;
                            res.status(httpResponse.statusCode).type("json").send(body)
                        })
                        .catch(function (err) {
                            LOGGER.error("Error while getting API: %s", err)
                            res.status(500).send({ error: err.message })
                        });
                }
                else {
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            }
        })
    }
};

function update(req, res) {
    LOGGER.debug("Update API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        updateAPI(req.body, req.params.api,
            function (error, httpResponse, body) {
                if (error) {
                    LOGGER.error("Error while updating API: %s", error)
                    res.status(500).send({ error: error.message })
                } else if (httpResponse.statusCode >= 400) {
                    LOGGER.error("Error while updating API: %s", JSON.stringify(body))
                    res.status(httpResponse.statusCode).type("json").send(body)
                } else {
                    LOGGER.debug("Received API data: %s", JSON.stringify(body))
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            })
    }
};

function deleteApi(req, res) {
    LOGGER.debug("Delete API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.delete({
            url: `${connection.info().metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(connection.info().certificate),
                key: fs.readFileSync(connection.privateKey())
            },
            rejectUnauthorized: !connection.info().insecure
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while deleting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while deleting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
}

function assureConnected() {
    if (!connection.isEstablished()) {
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

    return apiRouter;
}