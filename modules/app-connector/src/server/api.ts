#!/usr/bin/env node
'use strict'

import * as config from "@kyma-incubator/varkes-configuration"
import * as connection from './connection';
import * as kymaApi from './kyma/api';
import * as compassApi from './compass/api';
import * as common from './common';

export function findAll(): Promise<any> {
    return common.assureConnected(connection).then(() => {
        if (connection.info()!.type === connection.Type.Kyma)
            return kymaApi.findAll();
        else
            return compassApi.findAll();
    })
}

export function create(api: any): Promise<any> {
    return common.assureConnected(connection).then(() => {
        if (connection.info()!.type === connection.Type.Kyma)
            return kymaApi.create(api);
        else
            return compassApi.create(api);
    })
}

export function update(api: any, id: string): Promise<any> {
    return common.assureConnected(connection).then(() => {
        if (connection.info()!.type === connection.Type.Kyma)
            return kymaApi.update(api, id);
        else
            return compassApi.update(api, id);
    })
}

export function findOne(apiId: string): Promise<any | null> {
    return common.assureConnected(connection).then(() => {
        if (connection.info()!.type === connection.Type.Kyma)
            return kymaApi.findOne(apiId);
        else
            return compassApi.findOne(apiId);
    })
}

export function remove(apiId: string): Promise<string | null> {
    return common.assureConnected(connection).then(() => {
        if (connection.info()!.type === connection.Type.Kyma)
            return kymaApi.remove(apiId);
        else
            return compassApi.remove(apiId);
    })
}