#!/usr/bin/env node
'use strict'

import * as config from "varkes-configuration"
import * as request from 'request-promise';
import * as connection from '../connection';
import * as common from './common';

const LOGGER: any = config.logger("app-connector")

export function send(event: any): Promise<any> {
    return connection.eventsUrl().then((eventsUrl) => {
        let headers: any = {
            "Content-Type": "application/json"
        }
        if (event["event-tracing"]) {
            headers["x-b3-sampled"] = "1"
        }
        return request(common.createRequestOptions(connection, {
            uri: eventsUrl,
            method: "POST",
            headers: headers,
            body: event
        })).then((response: any) => {
            if (response.statusCode < 300) {
                LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body, ["id", "name"], 2))
                return response.body;
            } else {
                throw common.resolveError(response.statusCode, response.body, "sending event")
            }
        })
    })
}
