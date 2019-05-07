const LOGGER = require("../logger").logger
const express = require("express")
const services = require("../services")
const connection = require("../connection")
const appConnector = require("@varkes/app-connector").api
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
        let metadata = services.fillServiceMetadata(api, getOrigin(req))
        metadata.id = api.name
        apis.push(metadata)
    }
    var configEvents = varkesConfig.events;
    for (var i = 0; i < configEvents.length; i++) {
        var event = configEvents[i];
        let metadata = services.fillEventData(event)
        metadata.id = event.name;
        apis.push(metadata);
    }
    res.status(200).send(apis);
}
function getLocalApi(req, res) {
    LOGGER.debug("Getting Local API")
    let apiname = req.params.apiname;
    let api = varkesConfig.apis.find(x => x.name == apiname);
    if (api) {
        let serviceMetadata = services.fillServiceMetadata(api, getOrigin(req))
        serviceMetadata.id = apiname;
        res.status(200).send(serviceMetadata);
    }
    else {
        api = varkesConfig.events.find(x => x.name == apiname);
        if (api) {
            let eventMetadata = services.fillEventData(api)
            eventMetadata.id = apiname;
            res.status(200).send(eventMetadata);
        }
        else {
            let message = "api " + apiname + " does not exist";
            LOGGER.error(message);
            res.status(404).send({ error: message })
        }
    }
}
function getOrigin(req) {
    if (req.body.baseUrl && !req.body.baseUrl.match(/http(s)?:\/\//)) {
        return req.protocol + req.body.baseUrl
    }
    return req.body.baseUrl || req.protocol + "://" + req.headers.host
}

async function registerAll(req, res) {
    LOGGER.debug("Registering all Local APIs")
    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    }
    try {
        let registeredAPIs = await appConnector.findAll();
        services.createServicesFromConfig(getOrigin(req), varkesConfig, registeredAPIs)
        LOGGER.debug("Auto-registereing %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        res.status(200).send(connection.info())
    }
    catch (error) {
        var message = "There is an error while registering all APIs."
        LOGGER.error("Failed to register all APIs: %s", error.stack)
        res.status(500).send({ error: message })
    }
}
function getStatus(req, res) {
    LOGGER.debug("Getting Registration Status")
    res.status(200).send(services.getStatus());
}
async function create(req, res) {
    LOGGER.debug("Create Local API %s", req.params.apiname)

    var err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        let apiName = req.params.apiname;
        let apis = varkesConfig.apis;
        let events = varkesConfig.events;
        let apiFound = false;
        let serviceMetadata;
        for (var i = 0; i < apis.length; i++) {
            var api = apis[i];
            if (api.name == apiName) {
                serviceMetadata = services.fillServiceMetadata(api, getOrigin(req));
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
        var registeredAPIs = await appConnector.findAll();
        var reg_api
        if (registeredAPIs.length > 0)
            reg_api = registeredAPIs.find(x => x.name == serviceMetadata.name)
        if (!reg_api) {
            appConnector.create(serviceMetadata).then((result) => {
                res.status(result.statusCode).send(result.body);
            });
        }
        else {
            appConnector.update(serviceMetadata, reg_api.id).then((result) => {
                res.status(result.statusCode).send(result.body);
            })
            LOGGER.debug("Updated API successful: %s", api.name)
        }

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
    apiRouter.get("/apis", getAll)
    apiRouter.post("/registration", registerAll)
    apiRouter.get("/registration", getStatus)
    apiRouter.get("/apis/:apiname", getLocalApi)
    apiRouter.post("/apis/:apiname/register", create)
    return apiRouter
}