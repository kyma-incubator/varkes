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
    type: string,
    persistence: boolean,
    registerBasepath: boolean,
    registerSpec: boolean,
    provider: string,
    labels: any,
    csrf: boolean
}
type Config = {
    name: string,
    logo: string,
    apis: API[],
    events: Event[],
    location: string
}

export { Config, API, Event }
