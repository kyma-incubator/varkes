#!/usr/bin/env node
'use strict'

const LOGGER = require("./logger").logger
const yaml = require('js-yaml')
const fs = require("fs")
const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"
const { api, event, connection } = require("@varkes/app-connector")
var apiSucceedCount = 0;
var apisFailedCount = 0;
var apisCount = 0;
var regErrorMessage = ""
module.exports = {
    createServicesFromConfig: createServicesFromConfig,
    fillServiceMetadata: fillServiceMetadata,
    getStatus: getStatus,
    fillEventData: fillEventData
}

function createServicesFromConfig(baseUrl, varkesConfig, registeredApis) {
    if (!varkesConfig.apis && !varkesConfig.events)
        return;
    apiSucceedCount = 0;
    apisFailedCount = 0;
    apisCount = 0;
    apisCount += varkesConfig.apis.length;
    regErrorMessage = "";
    varkesConfig.apis.forEach(async (varkesApi) => {
        var reg_api
        if (registeredApis.length > 0)
            reg_api = registeredApis.find(x => x.name == varkesApi.name)
        try {
            let serviceData = fillServiceMetadata(varkesApi, baseUrl)
            if (!reg_api) {
                await api.create(serviceData);
                apiSucceedCount++;
                LOGGER.debug("Registered API successful: %s", varkesApi.name)
            }
            else {
                await api.update(serviceData, reg_api.id);
                apiSucceedCount++;
                LOGGER.debug("Updated API successful: %s", varkesApi.name)
            }
        }
        catch (err) {
            if (!reg_api) {
                apisFailedCount++;
                var message = "Registration of API '" + varkesApi.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
            else {
                apisFailedCount++;
                var message = "Updating API '" + varkesApi.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += "- " + message + "\n\n";
                LOGGER.error(message)
            }
        }
    });
    apisCount += varkesConfig.events.length;
    varkesConfig.events.forEach(async (event) => {
        var reg_api
        if (registeredApis.length > 0)
            reg_api = registeredApis.find(x => x.name == event.name)
        try {
            let serviceData = fillEventData(event)
            if (!reg_api) {
                await api.create(serviceData);
                apiSucceedCount++;
                LOGGER.debug("Registered Event API successful: %s", event.name)
            }
            else {
                await api.update(serviceData, reg_api.id);
                apiSucceedCount++;
                LOGGER.debug("Updated Event API successful: %s", event.name)
            }
        }
        catch (err) {
            if (!reg_api) {
                apisFailedCount++;
                var message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
            else {
                apisFailedCount++;
                var message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
        }

    });
}
function getStatus() {
    return {
        "successCount": apiSucceedCount,
        "failedCount": apisFailedCount,
        "apisCount": apisCount,
        "inProgress": apisCount != (apiSucceedCount + apisFailedCount),
        "errorMessage": regErrorMessage
    }
}

function fillEventData(event) {
    var specInJson
    if (event.specification.endsWith(".json")) {
        specInJson = JSON.parse(fs.readFileSync(event.specification))
    } else {
        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'))
    }
    let labels = event.labels ? event.labels : {};
    labels["type"] = "AsyncApi";
    var serviceData = {
        provider: event.provider ? event.provider : "Varkes",
        name: event.name,
        description: event.description ? event.description : event.name,
        labels: labels,
        events: {
            spec: specInJson
        }
    }
    return serviceData
}

function fillServiceMetadata(api, baseUrl) {
    let apiUrl = baseUrl
    let apiUrlWithBasepath = baseUrl
    if (api.basepath) {
        apiUrlWithBasepath = baseUrl + api.basepath
    }
    let specificationUrl = apiUrlWithBasepath + (api.metadata ? api.metadata : METADATA)
    if (api.type == "odata") {
        specificationUrl = apiUrlWithBasepath + "/$metadata"
    }

    let apiData = {
        targetUrl: api.registerBasepath != false ? apiUrlWithBasepath : apiUrl,
        credentials: {},
        specificationUrl: specificationUrl
    }

    if (api.auth == "oauth") {
        apiData.credentials.oauth = {
            url: apiUrlWithBasepath + (api.oauth ? api.oauth : OAUTH),
            clientId: "admin",
            clientSecret: "nimda"
        }
        if (api.csrf) {
            apiData.credentials.oauth["csrfInfo"] = {
                tokenEndpointURL: apiUrlWithBasepath
            }
        }
    }

    if (api.auth == "basic") {
        apiData.credentials.basic = {
            username: "admin",
            password: "nimda"
        }
        if (api.csrf) {
            apiData.credentials.basic["csrfInfo"] = {
                tokenEndpointURL: apiUrlWithBasepath
            }
        }
    }

    if (api.type == "odata") {
        apiData.apiType = "odata"
    }

    if (!api.type || api.type == "openapi") {
        var specInJson
        if (api.specification.endsWith(".json")) {
            specInJson = JSON.parse(fs.readFileSync(api.specification))
        } else {
            specInJson = yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'))
        }

        if (api.registerSpec != false) {
            apiData.spec = specInJson
        }

        if (!api.description) {
            if (specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("description")) {
                api.description = specInJson.info.description
            } else if (specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("title"))
                api.description = specInJson.info.title
        }
    }
    let labels = api.labels ? api.labels : {};
    labels["type"] = api.type == "odata" ? "OData" : "OpenAPI"
    var serviceData = {
        provider: api.provider ? api.provider : "Varkes",
        name: api.name,
        description: api.description ? api.description : api.name,
        labels: labels,
        api: apiData
    }

    return serviceData
}