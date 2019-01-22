var LOGGER = require("./logger").logger



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
        rejectUnauthorized: !localKyma
    }, (error, httpResponse, body) => {
        res.send(body)
    })
}

async function createEventsFromConfig(eventsConfig) {
    if (!eventsConfig)
        return

    eventMetadata = defineEventMetadata()
    for (i = 0; i < eventsConfig.length; i++) {
        event = eventsConfig[i]
        try {
            await createEvent(eventMetadata, event)
            LOGGER.debug("Registered Event API successful: %s", event.name)
        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
        }
    }
}

function createEvent(eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
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

        serviceJSON = JSON.parse(fs.readFileSync(event.specification_file))
        eventMetadata.events = serviceJSON;

        apis.createAPI(localKyma, eventMetadata, function (data, err) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
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
    sendEvent: sendEvent
}