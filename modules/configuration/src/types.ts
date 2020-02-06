#!/usr/bin/env node
'use strict'

type Event = {
    specification: string,
    name: string,
    description: string,
    labels: any
}
type API = {
    basepath: string,
    auth: string,
    oauth: string,
    name: string,
    description: string,
    metadata: string,
    specification: string,
    type: APIType,
    persistence: boolean,
    registerBasepath: boolean,
    registerSpec: boolean,
    labels: any,
    csrf: boolean
}
type Config = {
    name: string,
    logo: string,
    provider: string,
    application: string,
    apis: API[],
    events: Event[],
    location: string
}

export enum APIType {
    OData = "odata",
    OpenAPI = "openapi"
}

export enum APIAuth {
    OAuth = "oauth",
    Basic = "basic",
    None = "none"
}

export { Config, API, Event }
