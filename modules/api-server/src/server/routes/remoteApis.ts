#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
const LOGGER = config.logger("api-server")
import * as express from "express"
const openapiSampler = require('openapi-sampler')
import * as refParser from 'json-schema-ref-parser'
import { api, connection } from "@varkes/app-connector"
import * as services from "../services";

var varkesConfig: config.Config;

function getAll(req: express.Request, res: express.Response) {
    LOGGER.debug("Getting all APIs")
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.findAll().then((result: any[]) => {
            res.status(200).send(result.map((entity) => {
                if (entity.api) {
                    entity.api = {}
                }
                if (entity.events) {
                    entity.events = {}
                }
                return entity
            }));
        }, (err: any) => {
            LOGGER.error("Failed to get all apis: %s", err)
            res.status(500).send({ error: err.message })
        })
    }
}

function get(req: express.Request, res: express.Response) {
    LOGGER.debug("Get API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.findOne(req.params.api).then((result: any) => {
            if (!result) {
                res.status(404).type("json").send({ error: "API not found" })
                return
            }
            let body = result;
            body.id = req.params.api //comply with the api spec
            if (body.events && body.events.spec && Object.keys(body.events.spec).length !== 0) { //an empty events.spec {} causes bug
                dereferenceApi(body).then((result) => {
                    res.status(200).type("json").send(result)
                }, (err) => {
                    LOGGER.error("Failed to dereference the events spec: %s", err)
                    res.status(500).send({ error: err.message })
                })
            }
            else {
                if (body.name) {
                    body.events = loadEventSpecFromLocal(body.name)
                }
                res.status(200).type("json").send(body)
            }
        }, (err: any) => {
            LOGGER.error("Failed to get api '%s': %s", req.params.api, err)
            res.status(500).send({ error: err.message });
        })
    }
}

function loadEventSpecFromLocal(apiname: string) {
    LOGGER.debug("API with name " + apiname + " has no event spec, trying to find it local");

    let configEvents = varkesConfig.events;
    if (configEvents) {
        for (let i = 0; i < configEvents.length; i++) {
            let event = configEvents[i];
            let metadata: any = services.fillEventData(varkesConfig, event)
            if (metadata.name == apiname) {
                return metadata.events;
            }
        }
    }

    LOGGER.debug("local lookup of event API with name " + apiname + " failed as it does not exist");
    return null
}

function update(req: express.Request, res: express.Response) {
    LOGGER.debug("Update API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.update(req.body, req.params.api).then((result: any) => {
            if (!result) {
                res.status(404).type("json").send({ error: "API not found" })
            } else {
                res.status(200).send(result);
            }
        }, (err: any) => {
            LOGGER.error("Failed to update api '%s': %s", req.params.api, err)
            res.status(500).send({ error: err.message });
        })
    }
}

function deleteApi(req: express.Request, res: express.Response) {
    LOGGER.debug("Delete API %s", req.params.api)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.remove(req.params.api).then((result: any) => {
            if (!result) {
                res.status(404).type("json").send({ error: "API not found" })
            } else {
                res.status(200).send(result);
            }
        }, (err: any) => {
            LOGGER.error("Failed to delete api '%s': %s", req.params.api, err)
            res.status(500).send({ error: err.message });
        });
    }
}
function create(req: express.Request, res: express.Response) {
    LOGGER.debug("Creating API %s", req.body.name)
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        api.create(req.body).then((result: any) => {
            res.status(200).send(result);
        }, (err: any) => {
            LOGGER.error("Failed to create api '%s': %s", req.body.name, err)
            res.status(500).send({ error: err.message });
        });
    }
}
function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}
function dereferenceApi(body: any) {
    return new Promise((resolve, reject) => {
        refParser.dereference(body.events.spec)
            .then((schema: any) => {
                if (schema.asyncapi == "2.0.0") {
                    Object.keys(schema.channels).forEach((key) => {
                        if (schema.channels[key].publish) {
                            schema.channels[key].example = openapiSampler.sample(schema.channels[key].publish.message.payload)
                        }
                        else {
                            schema.channels[key].example = openapiSampler.sample(schema.channels[key].subscribe.message.payload)
                        }
                    })
                } else {
                    Object.keys(schema.topics).forEach((key) => {
                        if (schema.topics[key].publish) {
                            schema.topics[key].example = openapiSampler.sample(schema.topics[key].publish.payload)
                        }
                        else {
                            schema.topics[key].example = openapiSampler.sample(schema.topics[key].subscribe.payload)
                        }
                    })
                }

                body.events.spec = schema
                resolve(body);
            })
            .catch(function (err) {
                reject(err);
            })
    })

}
function router(config: config.Config) {
    let apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/", getAll)
    apiRouter.post("/", create)
    apiRouter.get("/:api", get)
    apiRouter.put("/:api", update)
    apiRouter.delete("/:api", deleteApi)

    return apiRouter
}
export { router }