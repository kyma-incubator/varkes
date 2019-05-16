#!/usr/bin/env node
'use strict'

import * as path from "path";
import * as fs from "fs"
import { logger as LOGGER } from "./logger"
const check_api = require("check_api");
const yaml = require("js-yaml");
const pretty_yaml = require('json-to-pretty-yaml')

function init(varkesConfigPath: string, currentDirectory: any) {
    let varkesConfig
    if (varkesConfigPath) {
        let endpointConfig = path.resolve(currentDirectory, varkesConfigPath)
        LOGGER.info("Using configuration %s", endpointConfig)
        varkesConfig = JSON.parse(fs.readFileSync(endpointConfig, "utf-8"))
        varkesConfig.apis.map((element: any) => {
            element.specification = path.resolve(path.dirname(endpointConfig), element.specification)
        })
        varkesConfig.events.map((element: any) => {
            element.specification = path.resolve(path.dirname(endpointConfig), element.specification)
        })
        configValidation(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/varkes_config_default.json", "utf-8"))
    }
    return varkesConfig
}

function configValidation(configJson: any) {
    let error_message = ""
    let events = configJson.events
    let apis = configJson.apis
    if (events) {
        for (let i = 1; i <= events.length; i++) {
            {
                let event = events[i - 1]
                if (!event.name) {
                    error_message += "\nevent number " + i + ": missing attribute 'name', a name is mandatory"
                }
                if (!event.specification) {
                    error_message += "\nevent '" + event.name + "': missing attribute 'specification', a specification is mandatory"
                }
                if (!event.specification.match(/^.+\.(json|yaml|yml)$/)) {
                    error_message += "\nevent '" + event.name + "': specification '" + event.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'"
                }
                else {
                    let specInJson
                    if (event.specification.endsWith(".json")) {
                        specInJson = JSON.parse(fs.readFileSync(event.specification, 'utf8'))
                    } else {
                        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'))
                    }
                    check_api.check_api(specInJson, {}, function (err: any, options: any) {
                        if (err) {
                            error_message += "\nevent " + event.name + ": Schema validation Error \n" + pretty_yaml.stringify(err)
                        }
                    })
                }
            }
        }
    }
    if (apis) {
        for (let i = 1; i <= apis.length; i++) {
            let api = apis[i - 1]
            if (api.auth && !(api.auth == "oauth" || api.auth == "none" || api.auth == "basic")) {
                error_message += "\napi " + (api.name ? api.name : "number " + i) + ": attribute 'auth' should be one of three values [oauth, basic, none]";
            }
        }
    }
    if (configJson.logo && !configJson.logo.match(/^.+\.(svg)$/)) {
        error_message += "\nlogo image must be in svg format"
    }
    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message)
    }
}
export { init };