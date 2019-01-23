var LOGGER = require("../logger").logger
const fs = require("fs")
const path = require("path")
var CONFIG = require("../config")
const apis = require("./apis");
var request = require("request")
const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
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

async function createEventsFromConfig(localKyma, eventsConfig) {
    if (!eventsConfig)
        return

    eventMetadata = defineEventMetadata()
    for (i = 0; i < eventsConfig.length; i++) {
        event = eventsConfig[i]
        try {
            await createEvent(localKyma, eventMetadata, event)
            LOGGER.debug("Registered Event API successful: %s", event.name)
        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
        }
    }
}

function createEvent(localKyma, eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        try {
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
            console.log(event.specification_file)
            serviceJSON = JSON.parse(fs.readFileSync(event.specification_file))

            eventMetadata.events = serviceJSON;

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
        }
        catch (err) {
            reject(err);
        }

    })
}

function defineEventMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "",
        "description": "",
        "labels": {
            "connected-app": "myApp"
        },
        "events": {
        }
    }
}

module.exports = {
    sendEvent: sendEvent,
    createEventsFromConfig: createEventsFromConfig
}