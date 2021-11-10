#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import exp = require("constants");
import * as request from 'request-promise';
import * as connection from '../connection';
import * as common from './common';

const LOGGER: any = config.logger("app-connector")

export function sendLegacyEvent(event: any): Promise<any> {
    return connection.legacyEventsUrl().then((legacyEventsUrl) => {
        LOGGER.debug("Received Body: " + JSON.stringify(event, null, 2));
        let headers: any = {
            "Content-Type": "application/json"
        }
        if (event["event-tracing"]) {
            headers["x-b3-sampled"] = "1"
        }
        LOGGER.debug("Sending Header: " + JSON.stringify(headers, null, 2));
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
        LOGGER.debug("Received Body: " + JSON.stringify(event, null, 2));
        let headers: any = {
            "Content-Type": "application/cloudevents+json"
        }
        if (event["eventtracing"]) {
            headers["x-b3-sampled"] = "1"
        }
        LOGGER.debug("Sending Header: " + JSON.stringify(headers, null, 2));
        return request(common.createRequestOptions(connection, {
            uri: cloudEventsUrl, 
            method: "POST",
            headers: headers,
            body: event
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body, null, 2))
                return response.body;
            } else {
                throw common.resolveError(response.statusCode, response.body, "sending cloud event in structured mode")
            }
        })
    })
}

export function sendCloudEventBinary(body: any, header: any): Promise<any> {
    return connection.cloudEventsUrl().then((cloudEventsUrl) => {
        LOGGER.debug("Received Body: " + JSON.stringify(body, null, 2) + " and Header: " + JSON.stringify(header, null, 2));
        let headers: any = {
            "Content-Type": "application/json",
            "ce-specversion": header["ce-specversion"],
            "ce-type": header["ce-type"],
            "ce-source": header["ce-source"],
            "ce-id": header["ce-id"]
        }
        if (body["event-tracing"]) {
            headers["x-b3-sampled"] = "1"
        }
        LOGGER.debug("Sending Header: " + JSON.stringify(headers, null, 2));
        return request(common.createRequestOptions(connection, {
            uri: cloudEventsUrl, 
            method: "POST",
            headers: headers,
            body: body
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body, null, 2))
                return response.body;
            } else {
                throw common.resolveError(response.statusCode, response.body, "sending cloud event in binary mode")
            }
        })
    })
}