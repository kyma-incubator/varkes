#!/usr/bin/env node
'use strict'

import { logger as LOGGER } from "./logger"
const yaml = require("js-yaml");
import * as fs from "fs"
const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"
import { api } from "@varkes/app-connector";
var apiSucceedCount = 0;
var apisFailedCount = 0;
var apisCount = 0;
var regErrorMessage = ""


async function createServicesFromConfig(baseUrl: any, varkesConfig: any, registeredApis: any) {
    if (!varkesConfig.apis && !varkesConfig.events)
        return;
    apiSucceedCount = 0;
    apisFailedCount = 0;
    apisCount = 0;
    apisCount += varkesConfig.apis.length;
    regErrorMessage = "";
    for (let i = 0; i < varkesConfig.apis.length; i++) {
        let varkesApi = varkesConfig.apis[i];
        let reg_api
        if (registeredApis.length > 0)
            reg_api = registeredApis.find((x: any) => x.name == varkesApi.name)
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
                let message = "Registration of API '" + varkesApi.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
            else {
                apisFailedCount++;
                let message = "Updating API '" + varkesApi.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += "- " + message + "\n\n";
                LOGGER.error(message)
            }
        }
    }
    apisCount += varkesConfig.events.length;
    for (let i = 0; i < varkesConfig.events.length; i++) {
        let event = varkesConfig.events[i];
        let reg_api;
        if (registeredApis.length > 0)
            reg_api = registeredApis.find((x: any) => x.name == event.name)
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
                let message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
            else {
                apisFailedCount++;
                let message = "Registration of Event '" + event.name + "' failed: " + JSON.stringify(err.message);
                regErrorMessage += message + "\n";
                LOGGER.error(message)
            }
        }

    }
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

function fillEventData(event: any) {
    let specInJson
    if (event.specification.endsWith(".json")) {
        specInJson = JSON.parse(fs.readFileSync(event.specification, 'utf8'))
    } else {
        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'))
    }
    let labels = event.labels ? event.labels : {};
    labels["type"] = "AsyncApi";
    let serviceData = {
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

function fillServiceMetadata(api: any, baseUrl: any) {
    let apiUrl = baseUrl
    let apiUrlWithBasepath = baseUrl
    if (api.basepath) {
        apiUrlWithBasepath = baseUrl + api.basepath
    }
    let specificationUrl = apiUrlWithBasepath + (api.metadata ? api.metadata : METADATA)
    if (api.type == "odata") {
        specificationUrl = apiUrlWithBasepath + "/$metadata"
    }

    let apiData: any = {
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
        let specInJson
        if (api.specification.endsWith(".json")) {
            specInJson = JSON.parse(fs.readFileSync(api.specification, 'utf8'))
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
    let serviceData = {
        provider: api.provider ? api.provider : "Varkes",
        name: api.name,
        description: api.description ? api.description : api.name,
        labels: labels,
        api: apiData
    }

    return serviceData
}
export {
    createServicesFromConfig,
    fillServiceMetadata,
    getStatus,
    fillEventData
}