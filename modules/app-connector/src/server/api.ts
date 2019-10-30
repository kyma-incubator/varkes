#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import * as request from 'request-promise';
import * as connection from './connection';
import * as common from './common';

const LOGGER: any = config.logger("app-connector")

export function findAll(): Promise<any> {
    return common.assureConnected(connection).then(() => {
        return request(common.createRequestOptions(connection, {
            uri: connection.info()!.metadataUrl,
            method: "GET"
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received all APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
                return response.body;
            } else {
                throw common.resolveError(response.statusCode, response.body, "getting all APIs")
            }
        })
    })
}

export function create(api: any):Promise<any> {
    return common.assureConnected(connection).then(() => {
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
    })
}

export function update(api: any, id: string):Promise<any> {
    return common.assureConnected(connection).then(() => {
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
    })
}

export function findOne(apiId: string):Promise<any|null> {
    return common.assureConnected(connection).then(() => {
        return request(common.createRequestOptions(connection, {
            uri: `${connection.info()!.metadataUrl}/${apiId}`,
            method: "GET"
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
                return response.body;
            } else if (response.statusCode == 404) {
                return null
            } else {
                throw common.resolveError(response.statusCode, response.body, "getting API")
            }
        })
    })
}

export function remove(apiId: string):Promise<string|null> {
    return common.assureConnected(connection).then(() => {
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
    })
}