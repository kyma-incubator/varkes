const request = require("request")
const LOGGER = require("../logger").logger
const express = require("express")
const services = require("../services")
const events = require("./events")
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

        apis.push(services.fillServiceMetadata(api, req.params.hostname))
    }
    var configEvents = varkesConfig.events;
    for (var i = 0; i < configEvents.length; i++) {
        var event = configEvents[i];
        apis.push(events.fillEventData(event));
    }
    res.status(200).send(apis);
}
function registerAll(req, res) {
    LOGGER.debug("Registering all Local APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    }
    var registeredAPIs = await services.getAllAPI()
    var promises = [
        services.createServicesFromConfig(req.params.hostname, varkesConfig.apis, registeredAPIs),
        services.createEventsFromConfig(varkesConfig.events, registeredAPIs)
    ]
    Promise.all(promises); //put logger for success and failure
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

function router(config) {
    var apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/", getAll)
    apiRouter.post("/registeration", registerAll)
    apiRouter.post("/:api/register", create)
    return apiRouter
}