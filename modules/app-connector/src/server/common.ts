#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"

const LOGGER: any = config.logger("app-connector")

function resolveError(statusCode: any, body: any, name: string) {
    let message = ""
    if (statusCode == 404) {
        message = "The Kyma application is not reachable, check if the paired application at Kyma is healthy";
    } else {
        message = "Problem while " + name + ": Kyma application API responded with status " + statusCode + (body ?
            " " + JSON.stringify(body, null, 2) : "");
    }
    LOGGER.error("Received error response with status: " + statusCode + " => " + message);
    return new Error(message)
}

function assureConnected(connection: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!connection.established()) {
            reject(new Error("Not connected to a kyma cluster, please re-connect"));
        }
        resolve(true)
    })
}

function createRequestOptions(connection: any, source: any) {
    LOGGER.debug("Calling " + source.method + " on " + source.uri)
    return Object.assign({
        agentOptions: {
            cert: connection.certificate(),
            key: connection.privateKey()
        },
        rejectUnauthorized: !connection.info().insecure,
        resolveWithFullResponse: true,
        json: true,
        simple: false
    }, source)
}

export { resolveError, assureConnected, createRequestOptions }
