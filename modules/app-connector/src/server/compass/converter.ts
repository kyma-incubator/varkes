#!/usr/bin/env node
'use strict'
const url = require('url');
import * as config from "varkes-configuration"
const LOGGER: any = config.logger("app-connector")

export function convertPackageArrayToOldArray(newArray: any[]): any[] {
  const result = [];
  if (newArray.length > 0) {
    for (var i = 0; i < newArray.length; i++) {
      let newPackage = newArray[i];
      if (newPackage.apiDefinitions) {
        if (newPackage.apiDefinitions.data.length > 0) {
          for (var j = 0; j < newPackage.apiDefinitions.data.length; j++) {
            let newEntry = newPackage.apiDefinitions.data[j];
            result.push(convertApiToOld(newPackage.id, newPackage.name, newEntry));
          }
        }
      }
      if (newPackage.eventDefinitions) {
        if (newPackage.eventDefinitions.data.length > 0) {
          for (var j = 0; j < newPackage.eventDefinitions.data.length; j++) {
            let newEntry = newPackage.eventDefinitions.data[j];
            result.push(convertEventToOld(newPackage.id, newPackage.name, newEntry));
          }
        }
      }
    }
  }
  return result;
}

export function convertApiToOld(packageId: string, packageName: string | null, newApi: any): any {
  let spec: any = decodeApiSpec(newApi.spec)
  let type
  if (newApi.spec && newApi.spec.type == "ODATA") {
    type = "OData v2"
  } else if (spec && spec.openapi) {
    type = "OpenAPI v" + spec.openapi.substring(0, spec.openapi.indexOf("."));
  }
  else if (spec && spec.swagger) {
    type = "Swagger v" + spec.swagger.substring(0, spec.swagger.indexOf("."))
  }
  else {
    type = "Unknown"
  }

  let varkesInfo: any = {
    type: type,
    packageId: packageId
  }

  if (newApi.spec && newApi.spec.type == "ODATA") {
    varkesInfo.metadataURL = newApi.targetURL + "/$metadata"
    let targetURL = new URL(newApi.targetURL)
    targetURL.pathname = "/api" + targetURL.pathname + "/console"
    varkesInfo.consoleURL = targetURL.toString()
  } else {
    varkesInfo.metadataURL = newApi.targetURL + "/metadata"
    varkesInfo.consoleURL = newApi.targetURL + "/console"
  }

  return {
    provider: "Varkes",
    id: newApi.id,
    name: newApi.name,
    description: newApi.description,
    varkes: varkesInfo,
    api: {
      targetUrl: newApi.targetURL,
      spec: spec
    },

  }
}

function encodeApiSpec(spec: any) {
  if (!spec) {
    return null;
  }
  if (spec instanceof String) {
    return spec;
  } else {
    return JSON.stringify(spec).replace('"', '\"').replace('\n', '');
  }
}

function decodeApiSpec(spec: any): any {
  if (!spec || !spec.data) {
    return null;
  }
  if (spec.format === 'JSON') {
    return JSON.parse(spec.data.replace('\"', '"'));
  } else if (spec.format === 'XML') {
    return spec.data;
  } else if (spec.format === 'YAML') {
    return spec.data;
  } else {
    throw new Error(`Spec format '${spec.format}' not supported`);
  }
}

export function convertEventToOld(packageId: string, packageName: string | null, newEvent: any): any {
  let spec: any = decodeApiSpec(newEvent.spec)
  let type = "AsyncApi v" + spec.asyncapi.substring(0, spec.asyncapi.indexOf("."));
  return {
    provider: "Varkes",
    id: newEvent.id,
    name: newEvent.name,
    description: newEvent.description,
    events: {
      spec: spec
    },
    varkes: {
      type: type,
      packageId: packageId
    }
  }
}

export function convertAuthToNew(api: any): any{
  let defaultAuth;
  if (api.api.credentials) {
    if (api.api.credentials.basic) {
      defaultAuth = {
        credential: {
          basic: {
            username: api.api.credentials.basic.username,
            password: api.api.credentials.basic.password
          }
        }
      }
    } else {
      defaultAuth = {
        credential: {
          oauth: {
            clientId: api.api.credentials.oauth.clientId,
            clientSecret: api.api.credentials.oauth.clientSecret,
            url: api.api.credentials.oauth.url
          }
        }
      }
    }
  }
  return defaultAuth
}
export function convertApiToNew(api: any): any {
  let spec;
  if (api.api.spec && api.api.apiType == "odata") {
    spec = {
      type: "ODATA",
      format: "XML",
      data: api.api.spec
    }
  } else if (api.api.spec) {
    spec = {
      type: "OPEN_API",
      format: "JSON",
      data: encodeApiSpec(api.api.spec)
    }
  }

  return {
    name: api.name,
    description: api.description,
    targetURL: api.api.targetUrl,
    spec: spec
  }
}

export function convertEventToNew(api: any): any {
  let spec;
  if (api.events.spec) {
    spec = {
      type: "ASYNC_API",
      format: "JSON",
      data: encodeApiSpec(api.events.spec)
    }
  }

  return {
    name: api.name,
    description: api.description,
    targetURL: api.targetURL,
    spec: spec
  }
}