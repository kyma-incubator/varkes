#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
const LOGGER: any = config.logger("app-connector")

export function convertApiArrayToOldArray(newArray: any[]): any[] {
  const result = [];
  if (newArray.length > 0) {
    for (var i = 0; i < newArray.length; i++) {
      let newApi = newArray[i];
      result.push(convertApiToOld(newApi));
    }
  }
  return result;
}

export function convertEventArrayToOldArray(newArray: any[]): any[] {
  const result = [];
  if (newArray.length > 0) {
    for (var i = 0; i < newArray.length; i++) {
      let newApi = newArray[i];
      result.push(convertEventToOld(newApi));
    }
  }
  return result;
}

export function convertApiToOld(newApi: any): any {
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

  return {
    provider: "Varkes",
    id: newApi.id,
    name: newApi.name,
    description: newApi.description,
    labels: {
      type: type
    },
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

export function convertEventToOld(newEvent: any): any {
  let spec: any = decodeApiSpec(newEvent.spec)
  let type = "AsyncApi v" + spec.asyncapi.substring(0, spec.asyncapi.indexOf("."));
  return {
    provider: "Varkes",
    id: newEvent.id,
    name: newEvent.name,
    description: newEvent.description,
    labels: {
      type: type
    },
    events: {
      spec: spec
    }
  }
}

export function convertApiToNew(api: any): any {
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
    defaultAuth: defaultAuth,
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