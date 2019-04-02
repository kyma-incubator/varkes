const request = require("request")
const LOGGER = require("../logger").logger
const express = require("express")
const services = require("../services")
const events = require("./events")
const connection = require("../connection")
module.exports = {
    router: router
}
var varkesConfig
function getAll(req, res) {
    LOGGER.debug("Getting all Local APIs")
    var apis = []
    var configApis = varkesConfig.apis;
    for (var i = 0; i < configApis.length; i++) {
        var api = configApis[i]

        apis.push(services.fillServiceMetadata(api, req.body.hostname || req.headers.host))
    }
    var configEvents = varkesConfig.events;
    for (var i = 0; i < configEvents.length; i++) {
        var event = configEvents[i];
        apis.push(events.fillEventData(event));
    }
    res.status(200).send(apis);
}
async function registerAll(req, res) {
    LOGGER.debug("Registering all Local APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    }
    try {
        var registeredAPIs = await services.getAllAPI()
        var promises = [
            services.createServicesFromConfig(req.body.hostname || req.headers.host, varkesConfig.apis, registeredAPIs),
            services.createEventsFromConfig(varkesConfig.events, registeredAPIs)
        ]
        await Promise.all(promises);
        LOGGER.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        res.status(200).send(connection.info())
    }
    catch (error) {
        var message = "There is an error while registering to kyma. Usually that is caused by an invalid or expired token URL."
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.status(401).send({ error: message })
    }
}
function create(req, res) {
    LOGGER.debug("Create Local API %s", req.params.api)

    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        let apiName = req.params.apiname;
        let apis = varkesConfig.apis;
        let events = varkesConfig.apis;
        let apiFound = false;
        let serviceMetadata;
        for (var i = 0; i < apis.length; i++) {
            var api = apis[i];
            if (api.name == apiName) {
                serviceMetadata = services.fillServiceMetadata(api, req.body.hostname || req.headers.host);
                apiFound = true;
                break;
            }
        }
        for (var i = 0; i < events.length && !apiFound; i++) {
            var event = events[i];
            if (event.name == apiName) {
                serviceMetadata = services.fillEventData(event);
                break;
            }
        }
        services.createAPI(serviceMetadata,
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
function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}
function router(config) {
    var apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/", getAll)
    apiRouter.post("/registeration", registerAll)
    apiRouter.post("/:apiname/register", create)
    return apiRouter
}