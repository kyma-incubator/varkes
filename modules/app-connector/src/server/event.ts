#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import * as connection from './connection';
import * as common from './common';
import * as kymaEvent from './kyma/event';

const LOGGER: any = config.logger("app-connector")

export function sendLegacyEvent(event: any): Promise<any> {
    return common.assureConnected(connection).then(() => {
        return kymaEvent.sendLegacyEvent(event)
    })
}

export function sendCloudEvent(event: any): Promise<any> {
    return common.assureConnected(connection).then( () => {
        return kymaEvent.sendCloudEvent(event)
    })
}
