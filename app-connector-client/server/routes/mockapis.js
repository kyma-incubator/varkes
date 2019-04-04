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
    LOGGER.debug("Getting all Mocked APIs")
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


function router(config) {
    var apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/", getAll)
    return apiRouter
}