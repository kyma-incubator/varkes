#!/usr/bin/env node
'use strict'

const LOGGER = require("../logger").logger
const express = require("express")
const openapiSampler = require('openapi-sampler');
const refParser = require('json-schema-ref-parser');
const { api, _, connection } = require("@varkes/app-connector")
module.exports = {
    router: router
}

function getAll(req, res) {
    LOGGER.debug("Getting all APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.findAll().then((result) => {
            res.status(200).send(result);
        }, (err) => {
            res.status(err.statusCode, err.message)
        })
    }
}

function get(req, res) {
    LOGGER.debug("Get API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.findOne(req.params.api).then((result) => {

            let body = result;
            body.id = req.params.api //comply with the api spec
            if (body.events && body.events.spec && Object.keys(body.events.spec).length !== 0) { //an empty events.spec {} causes bug
                dereferenceApi(body).then((result) => {
                    res.status(200).type("json").send(result)
                }, (err) => {
                    res.status(500).send({ error: err.message })
                })
            }
            else {
                res.status(200).type("json").send(body)
            }
        }, (err) => {
            res.status(err.statusCode).send(err.body);
        })
    }
}

function update(req, res) {
    LOGGER.debug("Update API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.update(req.body, req.params.api).then((result) => {
            res.status(200).send(result);
        }, (err) => {
            res.status(err.statusCode).send(err.message);
        })
    }
}

function deleteApi(req, res) {
    LOGGER.debug("Delete API %s", req.params.api)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.delete(req.params.api).then((result) => {
            res.status(200).send(result);
        }, (err) => {
            res.status(err.statusCode).send(err.message);
        });
    }
}
function create(req, res) {
    LOGGER.debug("Creating API %s", req.body.name)
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.create(req.body).then((result) => {
            res.status(200).send(result);
        }, (err) => {
            res.status(err.statusCode).send(err.message);
        });
    }
}
function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}
function dereferenceApi(body) {
    return new Promise(function (resolve, reject) {
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
                //res.status(200).type("json").send(body)
                resolve(body);
            })
            .catch(function (err) {
                reject(err);
            })
    })

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