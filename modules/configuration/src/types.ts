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
    metadata: string,
    specification: string,
    type: string,
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