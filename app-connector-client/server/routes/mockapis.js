const request = require("request")
const LOGGER = require("../logger").logger
const express = require("express")
const services = require("./services")
const events = require("./events")
module.exports = {
    router: router,
    getAll: getAll
}
var varkesConfig
function getAll(req, res) {
    LOGGER.debug("Getting all Mocked APIs")
    var apis = []
    var configApis = varkesConfig.apis;
    for (var i = 0; i < configApis.length; i++) {
        var api = configApis[i]
        var metadata = services.fillServiceMetadata(api, req.params.hostname);
        if (api.type == "odata") {
            metadata.type = "OData";
        }
        else {
            metadata.type = "OpenAPI"
        }
        apis.push(metadata)
    }
    var configEvents = varkesConfig.events;
    for (var i = 0; i < configEvents.length; i++) {
        var event = configEvents[i];
        var metadata = events.fillEventData(event);
        metadata.type = "Event";
        apis.push(metadata);
    }
    res.status(200).send(apis);
}


function router(config) {
    var apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/", getAll)
    return apiRouter
}