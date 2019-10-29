const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";
import path = require("path");
import fs = require("fs");
const check_api = require("check_api");
const yaml = require("js-yaml");
const pretty_yaml = require('json-to-pretty-yaml')
import * as logger from "./logger"
const LOGGER = logger.init("configuration")

export function load(configPath: string, currentPath: string): any {
    LOGGER.error("path:" + configPath+", current: "+currentPath)
    let config = loadFromFile(configPath ? configPath : "varkes_config.json", currentPath)
    resolve(config)
    validate(config)
    return config
}

function loadFromFile(configPath: string, currentPath: string): any {
    let configLocation = path.resolve(currentPath, configPath)
    LOGGER.info("Using configuration %s", configLocation)
    let config = JSON.parse(fs.readFileSync(configLocation, "utf-8"))
    config.location = configLocation
    return config
}

function resolve(config: any) {
    if (config.apis) {
        config.apis.map((api: any) => {
            api.specification = path.resolve(path.dirname(config.location), api.specification)
            if (api.added_endpoints) {
                api.added_endpoints.map((ae: any) => {
                    ae.filePath = path.resolve(path.dirname(config.location), ae.filePath)
                })
            }
        })
    }

    if (config.events) {
        config.events.map((element: any) => {
            element.specification = path.resolve(path.dirname(config.location), element.specification)
        })
    }
}

function validate(config: any) {
    let errors = validateBasics(config)
    errors = errors + validateEvents(config)
    errors = errors + validateApis(config)

    if (errors != "") {
        throw new Error("Validation of configuration failed: " + errors);
    }
}

function validateBasics(config: any) {
    let errors = ""
    if (config.logo && !config.logo.match(/^.+\.(svg)$/)) {
        errors += "\nlogo image must be in svg format"
    }
    return errors
}

function validateApis(config: any) {
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

function validateOdata(api: any): String {
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


function validateOpenApi(api: any): String {
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

function validateEvents(config: any) {
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