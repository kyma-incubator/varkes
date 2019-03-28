#!/usr/bin/env node
'use strict'

const path = require("path")
const fs = require('fs');
import { logger as LOGGER } from "./logger"
import { VarkesConfigType } from "./types";

function config(varkesConfigPath: string, currentPath: string): VarkesConfigType {
    var varkesConfig
    if (varkesConfigPath) {
        var endpointConfig = path.resolve(currentPath, varkesConfigPath)
        LOGGER.info("Using configuration %s", endpointConfig)
        varkesConfig = JSON.parse(fs.readFileSync(endpointConfig, "utf-8"))
        varkesConfig.apis.map((api: any) => {
            api.specification = path.resolve(path.dirname(endpointConfig), api.specification)
        })
        configValidation(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/varkes_config_default.json", "utf-8"))
    }
    return varkesConfig
}

function configValidation(configJson: VarkesConfigType) {
    var error_message = "";
    if (configJson.hasOwnProperty("apis")) {
        for (var i = 1; i <= configJson.apis.length; i++) {
            var api = configJson.apis[i - 1];
            if (!api.name) {
                error_message += "\napi number " + i + ": missing attribute 'name', a name is mandatory";
            }
            if (api.type && !api.type.match(/^(openapi|odata)$/)) {
                error_message += "\napi '" + api.name + "': type '" + api.type + "' is not matching the pattern '^(openapi|odata)$'";
            }
            if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
                error_message += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\w]+$'";
            }
            if (api.type == "odata" && !api.specification.match(/^.+\.xml$/)) {
                error_message += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.json$'";
            }
            if (api.type == "odata" && !api.basepath) {
                error_message += "\napi '" + api.name + "': missing attribute 'baseurl', a baseurl is mandatory";
            }
            else if (api.type == "odata" && !api.basepath.match(/^\/[/\\\w\.]+$/)) {
                error_message += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\\/[/\\\\\w\.]+$'";
            }
        }
    }

    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}

export { config }