var LOGGER = require("../logger").logger
const fs = require("fs")
const path = require("path")
var CONFIG = require("../config")
const apis = require("./apis");
var request = require("request")
const yaml = require('js-yaml');
var refParser = require('json-schema-ref-parser');
const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
const openapiSampler = require('openapi-sampler');
const check_api = require('check_api');
function sendEvent(req, res) {
    request.post({
        url: CONFIG.URLs.eventsUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: req.body,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !req.params.localKyma
    }, (error, httpResponse, body) => {
        res.send(body)
    })
}

async function createEventsFromConfig(localKyma, eventsConfig, registeredApis) {
    if (!eventsConfig)
        return

    eventMetadata = defineEventMetadata()
    for (i = 0; i < eventsConfig.length; i++) {
        event = eventsConfig[i];

        try {
            var reg_api;
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == event.name);
            if (!reg_api) {
                LOGGER.debug("Registered Event API successful: %s", event.name)
                await createEvent(localKyma, eventMetadata, event)
            }
            else {
                LOGGER.debug("Updated Event API successful: %s", event.name)
                await updateEvent(localKyma, eventMetadata, event, reg_api.id)
            }

        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
            throw error
        }
    }
}

async function createEvent(localKyma, eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        fillEventData(eventMetadata, event).then(function (result) {
            eventMetadata = result
            apis.createAPI(localKyma, eventMetadata, function (err, httpResponse, body) {
                if (err) {
                    reject(err)
                } else {
                    if (httpResponse.statusCode >= 400) {
                        var err = new Error(body.error);
                        reject(err);
                    }
                    resolve(body)
                }
            })
        })
            .catch(function (err) {
                reject(err)
            });

    })
}
async function updateEvent(localKyma, eventMetadata, event, event_id) {
    LOGGER.debug("Auto-update Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        fillEventData(eventMetadata, event).then(function (result) {
            eventMetadata = result;
            apis.updateAPI(localKyma, eventMetadata, event_id, function (err, httpResponse, body) {
                if (err) {
                    reject(err)
                } else {
                    if (httpResponse.statusCode >= 400) {
                        var err = new Error(body.error);
                        reject(err);
                    }
                    resolve(body)
                }
            })
        }).catch(function (err) {
            reject(err)
        });
    })
}
function fillEventData(eventMetadata, event) {
    return new Promise(function (resolve, reject) {
        eventMetadata.name = event.name;
        if (eventMetadata.description) {
            eventMetadata.description = event.description;
        }
        else {
            eventMetadata.description = event.name;
        }
        if (eventMetadata.labels) {
            eventMetadata.labels = event.labels;
        }

        var specInJson
        if (event.specification.endsWith(".json")) {
            specInJson = JSON.parse(fs.readFileSync(event.specification))
        } else {
            specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'));
        }
        check_api.check_api(specInJson)
        refParser.dereference(specInJson)
            .then(function (schema) {
                Object.keys(schema.topics).forEach((topicKey) => {
                    if (schema.topics[topicKey].publish) {
                        schema.topics[topicKey].example = openapiSampler.sample(schema.topics[topicKey].publish)
                    }
                    else {
                        schema.topics[topicKey].example = openapiSampler.sample(schema.topics[topicKey].subscribe)
                    }
                })
                eventMetadata.events.spec = schema;
                resolve(eventMetadata);
            })
            .catch(function (err) {
                reject(err)
            });
    })

}
function defineEventMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "",
        "description": "",
        "labels": {},
        "events": {
            "spec": {}
        }
    }
}

module.exports = {
    sendEvent: sendEvent,
    createEventsFromConfig: createEventsFromConfig
}