#!/usr/bin/env node
'use strict'

const LOGGER = require("./logger").logger
const yaml = require('js-yaml')
const fs = require("fs")
const connection = require("./connection")
const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"
const request = require("request-promise")
var apiSucceedCount = 0;
var apisFailedCount = 0;
var apisCount = 0;
var regErrorMessage = ""
module.exports = {
    createServicesFromConfig: createServicesFromConfig,
    getAllAPI: getAllAPI,
    getAllAPIs, getAllAPIs,
    createAPI: createAPI,
    updateAPI: updateAPI,
    fillServiceMetadata: fillServiceMetadata,
    getStatus: getStatus,
    fillEventData: fillEventData
}

function createServicesFromConfig(hostname, varkesConfig, registeredApis) {
    if (!varkesConfig.apis)
        return
    apiSucceedCount = 0;
    apisFailedCount = 0;
    apisCount = 0;
    apisCount += varkesConfig.apis.length;
    regErrorMessage = "";
    varkesConfig.apis.forEach((api) => {
        var reg_api
        if (registeredApis.length > 0)
            reg_api = registeredApis.find(x => x.name == api.name)
        if (!reg_api) {
            createService(api, false, hostname).then(() => {
                apiSucceedCount++;
                LOGGER.debug("Registered API successful: %s", api.name)
            }).catch((err) => {
                apisFailedCount++;
                var message = "Registration of API '" + api.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            });
        }
        else {
            updateService(api, reg_api.id, false, hostname).then(() => {
                apiSucceedCount++;
                LOGGER.debug("Updated API successful: %s", api.name)
            }).catch((err) => {
                apisFailedCount++;
                var message = "Updating API '" + api.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            });
        }
    });
    if (!varkesConfig.events)
        return;
    apisCount += varkesConfig.events.length;
    varkesConfig.events.forEach((event) => {
        var reg_api
        if (registeredApis.length > 0)
            reg_api = registeredApis.find(x => x.name == event.name)
        if (!reg_api) {
            createService(event, true).then(() => {
                apiSucceedCount++;
                LOGGER.debug("Registered Event API successful: %s", event.name)
            }).catch((err) => {
                apisFailedCount++;
                var message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            });;
        }
        else {
            updateService(event, reg_api.id, true).then(() => {
                apiSucceedCount++;
                LOGGER.debug("Updated Event API successful: %s", event.name)
            }).catch((err) => {
                apisFailedCount++;
                var message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            });
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
        console.log("*****create****")
        console.log("serviceData " + JSON.stringify(serviceData));
        createAPI(serviceData, function (err, httpResponse, body) {
            if (!err && httpResponse.statusCode < 400) {
                resolve(body)
            }
            else {
                if (!err) {
                    err = new Error("Response with status " + httpResponse.statusCode + " and body: " + JSON.stringify(body))
                }
                reject(err)

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
        console.log("*****update****")
        console.log("serviceData " + JSON.stringify(serviceData));
        updateAPI(serviceData, api_id, function (err, httpResponse, body) {
            if (!err && httpResponse.statusCode < 400) {
                resolve(body)
            }
            else {
                if (!err) {
                    err = new Error("Response with status " + httpResponse.statusCode + " and body: " + JSON.stringify(body))
                }
                reject(err)
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