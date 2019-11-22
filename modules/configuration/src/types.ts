#!/usr/bin/env node
'use strict'

type Event = {
    specification: string,
    name: string,
    description: string,
    labels: {}
}
type API = {
    basepath: string,
    auth: string,
    oauth: string,
    name: string,
    description: string,
    metadata: string,
    specification: string,
    type: string,
    persistence: boolean,
    registerBasepath: boolean,
    registerSpec: boolean,
    provider: string,
    labels: any,
    csrf: boolean,
    added_endpoints: Array<{ filePath: string, url: string }>
}
type Config = {
    name: string,
    logo: string,
    apis: API[],
    events: Event[],
    location: string
}

export { Config, API, Event }
