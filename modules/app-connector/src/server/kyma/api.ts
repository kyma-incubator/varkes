#!/usr/bin/env node
'use strict'

import * as config from "@kyma-incubator/varkes-configuration"
import * as request from 'request-promise';
import * as connection from '../connection';
import * as common from './common';

const LOGGER: any = config.logger("app-connector")

export function findAll(): Promise<any> {
    return request(common.createRequestOptions(connection, {
        uri: connection.info()!.metadataUrl,
        method: "GET"
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received all APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
            return response.body.map((entry: any) => {
                entry.varkes = determineType(entry)
                return entry
            });
        } else {
            throw common.resolveError(response.statusCode, response.body, "getting all APIs")
        }
    })
}

function determineType(entry: any) {
    let type = "unknown"
    if (entry.api && entry.api.apiType == "odata") {
        type = "OData v2"
    } else if (entry.api && entry.api.spec && entry.api.spec.openapi) {
        type = "OpenAPI v" + entry.api.spec.openapi.substring(0, entry.api.spec.openapi.indexOf("."));
    } else if (entry.api && entry.api.spec && entry.api.spec.swagger) {
        type = "Swagger v" + entry.api.spec.swagger.substring(0, entry.api.spec.swagger.indexOf("."))
    } else if (entry.events && entry.events.spec && entry.events.spec.asyncapi) {
        type = "AsyncApi v" + entry.events.spec.asyncapi.substring(0, entry.events.spec.asyncapi.indexOf("."));
    }

    let varkesInfo: any = {
        type: type,
    }
    if (entry.api && entry.api.targetUrl) {
        if (type == "OData v2") {
            let targetURL = new URL(entry.api.targetUrl)
            targetURL.pathname = "/api" + targetURL.pathname + "/console"
            varkesInfo.consoleURL = targetURL.toString()
            varkesInfo.metadataURL = (entry.api && entry.api.specificationUrl) ? entry.api.specificationUrl : entry.api.targetURL + "/$metadata"
        } else {
            varkesInfo.consoleURL = entry.api.targetUrl + "/console"
            varkesInfo.metadataURL = (entry.api && entry.api.specificationUrl) ? entry.api.specificationUrl : entry.api.targetURL + "/metadata"
        }
    }
    return varkesInfo
}

export function create(api: any): Promise<any> {
    return request(common.createRequestOptions(connection, {
        uri: connection.info()!.metadataUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: api
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received creation confirmation: %s", JSON.stringify(response.body, ["id", "name"], 2))
            return response.body;
        } else {
            throw common.resolveError(response.statusCode, response.body, "creating API")
        }
    })
}

export function update(api: any, id: string): Promise<any> {
    return request(common.createRequestOptions(connection, {
        uri: `${connection.info()!.metadataUrl}/${id}`,
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: api
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received updated APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
            return response.body;
        } else if (response.statusCode == 404) {
            return null
        } else {
            throw common.resolveError(response.statusCode, response.body, "updating API")
        }
    })
}

export function findOne(apiId: string): Promise<any | null> {
    return request(common.createRequestOptions(connection, {
        uri: `${connection.info()!.metadataUrl}/${apiId}`,
        method: "GET"
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
            response.body.varkes = determineType(response.body);
            return response.body
        } else if (response.statusCode == 404) {
            return null
        } else {
            throw common.resolveError(response.statusCode, response.body, "getting API")
        }
    })
}

export function remove(apiId: string): Promise<string | null> {
    return request(common.createRequestOptions(connection, {
        uri: `${connection.info()!.metadataUrl}/${apiId}`,
        method: "DELETE"
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received deletion confirmation")
            return apiId;
        } else if (response.statusCode == 404) {
            return null
        } else {
            throw common.resolveError(response.statusCode, response.body, "deleting API")
        }
    })
}