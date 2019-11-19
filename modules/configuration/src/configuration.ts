#!/usr/bin/env node
'use strict'

import path = require("path");
import fs = require("fs");
import * as logger from "./logger"
import { Config, API, Event } from "./types"
const URL = require("url").URL;
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
export async function resolve(configText: string, location: string = ""): Promise<Config> {
    let config = JSON.parse(configText)
    if (location) {
        config.location = location
    }
    LOGGER.info("Loading configuration from %s", config.location ? config.location : "string")
    await resolveSpecs(config)
    validate(config)
    return config
}

/**
 * Loads a configuration from file
 * 
 * @param configPath the relative path to the configuration file
 * @param currentPath the current working directory
 */
export function resolveFile(configPath: string, currentPath: string = ""): Promise<Config> {
    let configLocation = path.resolve(currentPath, configPath)
    let configText = fs.readFileSync(configLocation, "utf-8")
    return resolve(configText, configLocation)
}

async function resolveSpecs(config: Config) {
    let promises: any = []
    if (config.location) {
        if (config.apis) {
            promises = promises.concat(config.apis.map(async (api: API) => {
                if (stringIsAValidUrl(api.specification)) {
                    try {
                        api.specification = await getTmpFilePath(api.specification)
                    }
                    catch (err) {
                        throw err
                    }
                }
                else {
                    api.specification = path.resolve(path.dirname(config.location), api.specification)
                }
                if (api.added_endpoints) {
                    promises = promises.concat(api.added_endpoints.map(async (ae: any) => {
                        if (stringIsAValidUrl(ae.filePath)) {
                            try {
                                ae.filePath = await getTmpFilePath(ae.filePath)
                            }
                            catch (err) {
                                throw err
                            }
                        }
                        else {
                            ae.filePath = path.resolve(path.dirname(config.location), ae.filePath)
                        }
                    }))
                }
            }))
        }

        if (config.events) {
            promises = promises.concat(config.events.map(async (element: Event) => {
                if (stringIsAValidUrl(element.specification)) {
                    try {
                        element.specification = await getTmpFilePath(element.specification)
                    }
                    catch (err) {
                        throw err
                    }
                }
                else {
                    element.specification = path.resolve(path.dirname(config.location), element.specification)
                }
            }))
        }
    }
    return Promise.all(promises)
}
async function getTmpFilePath(url: string) {
    try {
        let response = await getSpecFromUrl(url)
        let content = response.body
        var tmpobj = tmp.fileSync()
        let filePath: string
        if (IsJsonString(content)) {
            filePath = tmpobj.name + ".json"
        }
        else {
            filePath = tmpobj.name + ".yaml"
        }
        fs.writeFileSync(filePath, response.body)
        return filePath
    }
    catch (err) {
        throw new Error("the url '" + url + "' is not reachable")
    }
}
function getSpecFromUrl(url: string) {
    return request.get({
        uri: url,
        resolveWithFullResponse: true,
        simple: false
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
    if (!api.specification.match(/^.+\.xml$/)) {
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
    if (!api.specification.match(/^.+\.(json|yaml|yml)$/)) {
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
function stringIsAValidUrl(str: string) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

function IsJsonString(str: string) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
