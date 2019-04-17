#!/usr/bin/env node
'use strict'

const LOGGER = require("./logger").logger
const yaml = require('js-yaml')
const fs = require("fs")
const connection = require("./connection")
const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"
const request = require("request-promise")
var apis_success = [];
var apis_failed = [];
var apis = [];
const DONE_PROGRESS = "Done";
const IN_PROGRESS = "In Progress";
var progress = DONE_PROGRESS
module.exports = {
    createServicesFromConfig: createServicesFromConfig,
    getAllAPI: getAllAPI,
    getAllAPIs, getAllAPIs,
    createAPI: createAPI,
    updateAPI: updateAPI,
    fillServiceMetadata: fillServiceMetadata,
    getStatus: getStatus,
    createEventsFromConfig: createEventsFromConfig,
    fillEventData: fillEventData
}

async function createServicesFromConfig(hostname, apisConfig, registeredApis) {
    if (!apisConfig)
        return
    progress = IN_PROGRESS
    apis = apis.concat(apisConfig);
    var error_message = ""
    apis_success = [];
    apis_failed = [];
    for (var i = 0; i < apisConfig.length; i++) {
        var api = apisConfig[i]
        try {
            var reg_api
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == api.name)
            if (!reg_api) {
                await createService(api, false, hostname)
                LOGGER.debug("Registered API successful: %s", api.name)
            }
            else {
                await updateService(api, reg_api.id, false, hostname)
                LOGGER.debug("Updated API successful: %s", api.name)
            }
            apis_success.push(api.name);


        } catch (error) {
            var message = "Registration of API " + api.name + " failed: " + JSON.stringify(error.message)
            LOGGER.error(message)
            error_message += "\n" + message
            apis_failed.push(api.name);
        }
    }
    if (error_message != "") {
        throw new Error(error_message)
    }
    return registeredApis
}

async function createEventsFromConfig(eventsConfig, registeredApis) {
    if (!eventsConfig)
        return
    apis = apis.concat(eventsConfig);
    var error_message = ""
    for (var i = 0; i < eventsConfig.length; i++) {
        var event = eventsConfig[i]
        try {
            var reg_api
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == event.name)
            if (!reg_api) {
                LOGGER.debug("Registered Event API successful: %s", event.name)
                await createService(event, true)
            }
            else {
                LOGGER.debug("Updated Event API successful: %s", event.name)
                await updateService(event, reg_api.id, true)
            }
            apis_success.push(event.name)
        } catch (error) {
            var message = "Registration of Event API " + event.name + " failed: " + JSON.stringify(error, null, 2)
            LOGGER.error(message)
            error_message += "\n" + message
            apis_failed.push(event.name);
        }
    }
    if (error_message != "") {
        throw new Error(error_message)
    }
    progress = DONE_PROGRESS;
}
function getStatus() {
    return {
        "success_count": apis_success.length,
        "failed_count": apis_failed.length,
        "apis_success": apis_success,
        "apis_failed": apis_failed,
        "apis": apis,
        "progress": progress
    }
}
function createService(api, isEvent, hostname) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        let serviceData;
        if (isEvent) {
            serviceData = fillEventData(api)
        }
        else {
            serviceData = fillServiceMetadata(api, hostname)
        }

        createAPI(serviceData, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error("Response with status " + httpResponse.statusCode + " and body: " + body)
                    reject(err)
                }
                else {
                    resolve(body)
                }
            }
        })
    })
}

function updateService(api, api_id, isEvent, hostname) {
    LOGGER.debug("Auto-update API '%s'", api.name)
    return new Promise((resolve, reject) => {
        let serviceData;
        if (isEvent) {
            serviceData = fillEventData(api)
        }
        else {
            serviceData = fillServiceMetadata(api, hostname)
        }
        updateAPI(serviceData, api_id, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error("Response with status " + httpResponse.statusCode + " and body: " + body)
                    reject(err)
                }
                else {
                    resolve(body)
                }
            }
        })
    })
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
function getAllAPI() {
    LOGGER.debug("Get all API ")
    return new Promise((resolve, reject) => {
        getAllAPIs(function (error, httpResponse, body) {
            if (error) {
                reject(error)
            } else if (httpResponse.statusCode >= 400) {
                var err = new Error("Response with status " + httpResponse.statusCode + " and body: " + body)
                reject(err)
            } else {
                resolve(JSON.parse(body))
            }
        })
    })
}
function getAllAPIs(cb) {
    request({
        url: connection.info().metadataUrl,
        method: "GET",
        agentOptions: {
            cert: connection.certificate(),
            key: connection.privateKey()
        },
        rejectUnauthorized: connection.secure()
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body)
    })
}
function createAPI(serviceMetadata, cb) {
    request.post({
        url: connection.info().metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: connection.certificate(),
            key: connection.privateKey()
        },
        rejectUnauthorized: connection.secure()
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body)
    })
}

function updateAPI(serviceMetadata, api_id, cb) {
    request.put({
        url: `${connection.info().metadataUrl}/${api_id}`,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: connection.certificate(),
            key: connection.privateKey()
        },
        rejectUnauthorized: connection.secure()
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body)
    })
}

function fillServiceMetadata(api, hostname) {
    let apiUrl = hostname
    let apiUrlWithBasepath = hostname
    if (api.basepath) {
        apiUrlWithBasepath = hostname + api.basepath
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
        apiData.spec = specInJson

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