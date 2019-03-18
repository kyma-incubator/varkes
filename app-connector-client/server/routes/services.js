#!/usr/bin/env node
'use strict'

const LOGGER = require("../logger").logger
const yaml = require('js-yaml');
const fs = require("fs")
const apis = require("./apis");

const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"

module.exports = {
    createServicesFromConfig: createServicesFromConfig,
    getAllAPI: getAllAPI
}

async function createServicesFromConfig(localKyma, hostname, apisConfig, registeredApis) {
    if (!apisConfig)
        return

    var serviceMetadata = defineServiceMetadata()
    var error_message = ""
    var promises = []
    for (var i = 0; i < apisConfig.length; i++) {
        var api = apisConfig[i]
        try {
            var reg_api;
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == api.name);
            if (!reg_api) {
                promises.push(createService(localKyma, serviceMetadata, api, hostname))
                LOGGER.debug("Registered API successful: %s", api.name)
            }
            else {
                promises.push(updateService(localKyma, serviceMetadata, api, reg_api.id, hostname));
                LOGGER.debug("Updated API successful: %s", api.name)
            }
            await Promise.all(promises);
        } catch (error) {
            var message = "Registration of API " + api.name + "failed: " + error.message
            LOGGER.error(message)
            error_message += "\n" + message
        }
    }
    if (error_message != "") {
        throw new Error(error_message);
    }
    return registeredApis;
}

function createService(localKyma, serviceMetadata, api, hostname) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata = fillServiceMetadata(serviceMetadata, api, hostname);
        apis.createAPI(localKyma, serviceMetadata, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                else {
                    resolve(body)
                }
            }
        });
    })
}

function updateService(localKyma, serviceMetadata, api, api_id, hostname) {
    LOGGER.debug("Auto-update API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata = fillServiceMetadata(serviceMetadata, api, hostname);
        apis.updateAPI(localKyma, serviceMetadata, api_id, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                else {
                    resolve(body)
                }
            }
        });
    })
}

function getAllAPI(localKyma) {
    LOGGER.debug("Get all API ")
    return new Promise((resolve, reject) => {
        apis.getAllAPIs(localKyma, function (error, httpResponse, body) {
            if (error) {
                reject(error);
            } else if (httpResponse.statusCode >= 400) {
                var err = new Error(body.error);
                reject(err);
            } else {
                resolve(JSON.parse(body))
            }
        })
    })
}

function fillServiceMetadata(serviceMetadata, api, hostname) {
    serviceMetadata.name = api.name;
    serviceMetadata.api.targetUrl = hostname;
    if (api.baseurl)
        serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

    serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + (api.oauth ? api.oauth : OAUTH);
    if (!api.type || api.type != "odata") {
        var specInJson
        if (api.specification.endsWith(".json")) {
            specInJson = JSON.parse(fs.readFileSync(api.specification))
        } else {
            specInJson = yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'));
        }
        serviceMetadata.api.spec = specInJson

        if(!api.description && specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("description")){
            api.description = specInJson.info.description
        }

        if (!api.name && specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("title")) {
            api.name = specInJson.info.title;
        }
    }
    else {
        serviceMetadata.api.apiType = "odata";
    }

    if (api.provider) {
        serviceMetadata.provider = api.provider
    }

    if (api.description) {
        serviceMetadata.description = api.description;
    } else {
        serviceMetadata.description = api.name;
    }

    serviceMetadata.api.specificationUrl = serviceMetadata.api.targetUrl + (api.metadata ? api.metadata : METADATA);
    return serviceMetadata;
}

function defineServiceMetadata() {
    return {
        "provider": "Varkes",
        "name": "ec-mock-service-4",
        "description": "",
        "api": {
            "targetUrl": "http://localhost/target",
            "credentials": {
                "oauth": {
                    "url": "http://localhost/oauth/validate",
                    "clientId": "string",
                    "clientSecret": "string"
                }
            },
            "spec": {}
        }
    }
}