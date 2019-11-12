#!/usr/bin/env node
'use strict'

import path = require("path");
import fs = require("fs");
import * as logger from "./logger"
import { Config, API, Event } from "./types"

const check_api = require("check_api");
const yaml = require("js-yaml");
const pretty_yaml = require('json-to-pretty-yaml')
import * as request from "request-promise";
import * as tmp from "tmp"
const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";
const LOGGER = logger.logger("configuration")
const URL_REGEX = /^((http|https):\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(\.[a-z]{2,5})*(:[0-9]{1,5})?(\/.*)?$/
/**
 * Loads a config from a string
 * 
 * @param configText the string containing the configuration as text
 * @param location optional absolute path to the config in order to resolve referenced spec files
 */
export async function resolve(configText: string, location: string = "") {
    let config = JSON.parse(configText)
    if (location) {
        config.location = location
    }
    LOGGER.info("Loading configuration from %s", config.location ? config.location : "string")
    validate(config)
    await resolveSpecs(config)
    return config
}

/**
 * Loads a configuration from file
 * 
 * @param configPath the relative path to the configuration file
 * @param currentPath the current working directory
 */
export async function resolveFile(configPath: string, currentPath: string = "") {
    let configLocation = path.resolve(currentPath, configPath)
    let configText = fs.readFileSync(configLocation, "utf-8")
    return await resolve(configText, configLocation)
}

async function resolveSpecs(config: Config) {
    let promises: any = []
    if (config.location) {
        if (config.apis) {
            promises = promises.concat(config.apis.map(async (api: API) => {
                if (!api.specification.match(URL_REGEX)) {
                    api.specification = path.resolve(path.dirname(config.location), api.specification)
                }
                else {
                    let body = await getSpecFromUrl(api.specification)
                    var tmpobj = tmp.fileSync()
                    fs.writeFileSync(tmpobj.name, body)
                    api.specification = tmpobj.name
                }
                if (api.added_endpoints) {
                    api.added_endpoints.map((ae: any) => {
                        ae.filePath = path.resolve(path.dirname(config.location), ae.filePath)
                    })
                }
            }))
        }

        if (config.events) {
            config.events.map((element: Event) => {
                element.specification = path.resolve(path.dirname(config.location), element.specification)
            })
        }
    }
    return Promise.all(promises)
}
function getSpecFromUrl(url: string) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: url,
            resolveWithFullResponse: true,
            simple: false
        }).then((response: any) => {
            resolve(response.body)
        })
    })
}
function validate(config: Config) {
    let errors = validateBasics(config)
    errors = errors + validateEvents(config)
    errors = errors + validateApis(config)

    if (errors != "") {
        throw new Error("Validation of configuration failed: " + errors);
    }
}

function validateBasics(config: Config) {
    let errors = ""
    if (config.logo && !config.logo.match(/^.+\.(svg)$/)) {
        errors += "\nlogo image must be in svg format"
    }
    return errors
}

function validateApis(config: Config) {
    let apis = config.apis
    let errors = ""
    if (apis) {
        for (let i = 1; i <= apis.length; i++) {
            let api = apis[i - 1]
            if (api.auth && !(api.auth == "oauth" || api.auth == "none" || api.auth == "basic")) {
                errors += "\napi " + (api.name ? api.name : "number " + i) + ": attribute 'auth' should be one of three values [oauth, basic, none]";
            }

            if (!api.name) {
                errors += "\napi number " + i + ": missing attribute 'name', a name is mandatory";

            }
            if (!api.type || api.type == "openapi") {
                api.type = "openapi"
                api.oauth = api.oauth ? api.oauth : OAUTH
                api.metadata = api.metadata ? api.metadata : METADATA
                errors += validateOpenApi(api)
            }
            else if (api.type == "odata") {
                errors += validateOdata(api)
            }
            else {
                errors += "\napi '" + api.name + "': type '" + api.type + "' is not matching the pattern '^(openapi|odata)$'";
            }
        }
    }
    return errors
}

function validateOdata(api: API): String {
    let errors = ""
    if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        errors += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\w]+$'";
    }
    if (!api.specification.match(/^.+\.xml$/) &&
        !api.specification.match(URL_REGEX)) {
        errors += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.json$' and is not a url";
    }
    if (!api.basepath) {
        errors += "\napi '" + api.name + "': missing attribute 'basepath', a basepath is mandatory";
    }
    else if (!api.basepath.match(/^\/([/\\\w\.]+\/)*odata(\/[/\\\w\.]+)*$/)) {
        errors += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\/([/\\\w\.]+\/)*odata(\/[/\\\w\.]+)*$'";
    }
    return errors
}


function validateOpenApi(api: API): String {
    let errors = "";
    if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        errors += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\\w]+$+'";
    }
    if (!api.oauth.match(/^\/[/\\\w]+$/)) {
        errors += "\napi '" + api.name + "': oauth '" + api.oauth + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
    }
    if (!api.specification.match(/^.+\.(json|yaml|yml)$/) &&
        !api.specification.match(URL_REGEX)) {
        errors += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$' and is not a url";
    }
    if (!api.basepath) {
        errors += "\napi '" + api.name + "': missing attribute 'basepath', a basepath is mandatory";
    }
    else if (!api.basepath.match(/^\/[/\\\w]+$/)) {
        errors += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
    }
    return errors
}

function validateEvents(config: Config) {
    let events = config.events
    let errors = ""
    if (events) {
        for (let i = 1; i <= events.length; i++) {
            let event = events[i - 1]
            if (!event.name) {
                errors += "\nevent number " + i + ": missing attribute 'name', a name is mandatory"
            }
            if (!event.specification) {
                errors += "\nevent '" + event.name + "': missing attribute 'specification', a specification is mandatory"
            } else if (!event.specification.match(/^.+\.(json|yaml|yml)$/)) {
                errors += "\nevent '" + event.name + "': specification '" + event.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'"
            } else {
                let specInJson
                if (event.specification.endsWith(".json")) {
                    specInJson = JSON.parse(fs.readFileSync(event.specification, 'utf8'))
                } else {
                    specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'))
                }
                check_api.check_api(specInJson, {}, function (err: any, options: any) {
                    if (err) {
                        errors += "\nevent " + event.name + ": Schema validation Error \n" + pretty_yaml.stringify(err)
                    }
                })
            }
        }
    }

    return errors
}
