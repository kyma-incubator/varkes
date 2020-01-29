#!/usr/bin/env node
'use strict'

import path = require("path");
import fs = require("fs");
import * as logger from "./logger"
import { Config, API, Event, APIType, APIAuth } from "./types"
import * as request from "request-promise";
import { uuid } from 'uuidv4';

const URL = require("url").URL;
const check_api = require("check_api");
const yaml = require("js-yaml");
const pretty_yaml = require('json-to-pretty-yaml')
const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";
const LOGGER = logger.logger("configuration")
const DIR_NAME = "./generated/";

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

async function resolveSpecs(config: Config): Promise<any> {
    let promises: Promise<void>[] = []
    if (config.location) {
        if (config.apis) {
            promises = promises.concat(config.apis.map((element: API) => resolveSpecsOfElement(config, element)))
        }

        if (config.events) {
            promises = promises.concat(config.events.map((element: Event) => resolveSpecsOfElement(config, element)))
        }
    }
    return Promise.all(promises)
}

function resolveSpecsOfElement(config: Config, element: Event | API): Promise<void> {
    if (isValidUrl(element.specification)) {
        return downloadSpec(element).then((fileName: string) => {
            element.specification = fileName
        })
    }
    else {
        element.specification = path.resolve(path.dirname(config.location), element.specification)
        return Promise.resolve()
    }
}

function downloadSpec(api: API | Event): Promise<string> {
    LOGGER.debug(`Downloading for API ${api.name} spec from ${api.specification}`)
    return request.get({
        uri: api.specification,
        resolveWithFullResponse: true,
        simple: false
    }).then(function (response) {
        if (response.statusCode >= 300) {
            throw new Error(`Cannot download specification of API ${api.name} with URL ${api.specification}: Got a ${response.statusCode} with message ${response.body}`)
        }
        let fileType
        if (api.specification.endsWith("json")) {
            fileType = ".json"
        } else if (api.specification.endsWith("yaml") || api.specification.endsWith("yml")) {
            fileType = ".yaml"
        } else if (api.specification.endsWith("xml")) {
            fileType = ".xml"
        } else {
            throw new Error(`Cannot determine file extension for specification of API ${api.name} with URL ${api.specification}`)
        }

        let fileName = DIR_NAME + uuid() + fileType;
        LOGGER.debug("Writing api '%s' to file '%s' and length %d", api.name, fileName, response.body.length);
        if (!fs.existsSync(DIR_NAME)) {
            fs.mkdirSync(DIR_NAME);
        }

        fs.writeFileSync(fileName, response.body);
        return fileName
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
            if (api.auth && !(api.auth === APIAuth.OAuth || api.auth === APIAuth.None || api.auth === APIAuth.Basic)) {
                errors += "\napi " + (api.name ? api.name : "number " + i) + ": attribute 'auth' should be one of three values [oauth, basic, none]";
            }

            if (!api.name) {
                errors += "\napi number " + i + ": missing attribute 'name', a name is mandatory";

            }
            if (!api.type || api.type === APIType.OpenAPI) {
                api.type = APIType.OpenAPI
                api.oauth = api.oauth ? api.oauth : OAUTH
                api.metadata = api.metadata ? api.metadata : METADATA
                errors += validateOpenApi(api)
            }
            else if (api.type === APIType.OData) {
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
        errors += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.json$'";
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
        errors += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'";
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
                if (specInJson.asyncapi != "2.0.0") {
                    check_api.check_api(specInJson, {}, function (err: any, options: any) {
                        if (err) {
                            errors += "\nevent " + event.name + ": Schema validation Error \n" + pretty_yaml.stringify(err)
                        }
                    })
                }
            }
        }
    }

    return errors
}
function isValidUrl(str: string) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}
