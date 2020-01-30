#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import { api, connection } from "@varkes/app-connector";
import * as fs from "fs"

const LOGGER = config.logger("api-server")
const yaml = require("js-yaml");
const OAUTH = "/authorizationserver/oauth/token"
const METADATA = "/metadata"

var apiSucceedCount = 0;
var apisFailedCount = 0;
var apisCount = 0;
var regErrorMessage = ""

async function createServicesFromConfig(baseUrl: string, varkesConfig: config.Config, registeredApis: any) {
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
    labels["type"] = "AsyncApi v" + specInJson.asyncapi.substring(0, specInJson.asyncapi.indexOf("."));
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

function fillServiceMetadata(api: config.API, baseUrl: string) {
    let apiUrl = baseUrl
    let apiUrlWithBasepath = baseUrl
    if (api.basepath) {
        apiUrlWithBasepath = baseUrl + api.basepath
    }
    let specificationUrl = apiUrlWithBasepath + (api.metadata ? api.metadata : METADATA)
    if (api.type === config.APIType.OData) {
        specificationUrl = apiUrlWithBasepath + "/$metadata"
    }

    let apiData: any = {
        targetUrl: api.registerBasepath != false ? apiUrlWithBasepath : apiUrl,
        credentials: {},
        specificationUrl: specificationUrl
    }

    if (api.auth === config.APIAuth.OAuth) {
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

    if (api.auth === config.APIAuth.Basic) {
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

    if (api.type === config.APIType.OData) {
        apiData.apiType = "odata"
    }

    let specInJson
    if (api.specification.endsWith(".json")) {
        specInJson = JSON.parse(fs.readFileSync(api.specification, 'utf8'))
    } else if (api.specification.endsWith(".yaml") || api.specification.endsWith(".yml")) {
        specInJson = yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'))
    } else {
        specInJson = fs.readFileSync(api.specification, 'utf8')
    }

    if (api.registerSpec != false && !(api.type === config.APIType.OData && connection.established() && connection.info().type === connection.Type.Kyma)) {
        apiData.spec = specInJson
    }

    if (!api.description) {
        if (specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("description")) {
            api.description = specInJson.info.description
        } else if (specInJson.hasOwnProperty("info") && specInJson.info.hasOwnProperty("title"))
            api.description = specInJson.info.title
    }

    let labels = api.labels ? api.labels : {};
    labels["type"] = api.type === config.APIType.OData ? "OData" : "OpenAPI"
    if (api.type === config.APIType.OData) {
        labels["type"] = "OData v" + 2
    }
    else if (apiData.spec.openapi) {

        labels["type"] = "OpenAPI v" + apiData.spec.openapi.substring(0, apiData.spec.openapi.indexOf("."));
    }
    else if (apiData.spec.swagger) {
        labels["type"] = "Swagger v" + apiData.spec.swagger.substring(0, apiData.spec.swagger.indexOf("."))
    }
    else {
        labels["type"] = "Other"
    }
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