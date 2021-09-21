#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import * as request from 'request-promise';
import * as connection from '../connection';
import * as common from './common';

const LOGGER: any = config.logger("app-connector")

export function sendLegacyEvent(event: any): Promise<any> {
    return connection.legacyEventsUrl().then((legacyEventsUrl) => {
        let headers: any = {
            "Content-Type": "application/json"
        }
        if (event["event-tracing"]) {
            headers["x-b3-sampled"] = "1"
        }
        return request(common.createRequestOptions(connection, {
            uri: legacyEventsUrl,
            method: "POST",
            headers: headers,
            body: event
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body, ["id", "name"], 2))
                return response.body;
            } else {
                throw common.resolveError(response.statusCode, response.body, "sending legacy event")
            }
        })
    })
}

export function sendCloudEvent(event: any): Promise<any> {
    return connection.cloudEventsUrl().then((cloudEventsUrl) => {
        let headers: any = {
            "Content-Type": "application/cloudevents+json"
        }
    return request(common.createRequestOptions(connection, {
        uri: cloudEventsUrl, 
        method: "POST",
        headers: headers,
        body: event
    })).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body))
            return response.body;
        } else {
            throw common.resolveError(response.statusCode, response.body, "sending cloud event")
        }
    })
})
}
