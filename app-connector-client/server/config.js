#!/usr/bin/env node
'use strict'

const path = require("path")
const fs = require('fs');
const LOGGER = require("./logger").logger
const check_api = require('check_api');
const yaml = require('js-yaml');
module.exports = function (varkesConfigPath) {
    var varkesConfig
    if (varkesConfigPath) {
        var endpointConfig = path.resolve(varkesConfigPath);
        LOGGER.info("Using configuration %s", endpointConfig);
        varkesConfig = require(endpointConfig);
        configValidation(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/defaultConfig.json", "utf-8"))
    }
    return varkesConfig
}

function configValidation(configJson) {
    var error_message = "";

    var events = configJson.events;
    if (events) {
        for (var i = 1; i <= events.length; i++) {
            {
                var event = events[i - 1];

                if (!event.name) {
                    error_message += "\nevent number " + i + ": missing attribute 'name', a name is mandatory";
                }
                if (!event.specification) {
                    error_message += "\nevent '" + event.name + "': missing attribute 'specification', a specification is mandatory";
                }
                if (!event.specification.match(/^.+\.(json|yaml|yml)$/)) {
                    error_message += "\nevent '" + event.name + "': specification '" + event.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'";
                }
                else {
                    var specInJson
                    if (event.specification.endsWith(".json")) {
                        specInJson = JSON.parse(fs.readFileSync(event.specification))
                    } else {
                        specInJson = yaml.safeLoad(fs.readFileSync(event.specification, 'utf8'));
                    }
                    check_api.check_api(specInJson, {}, function (err, options) {
                        if (err) {
                            error_message += "\nevent number " + i + ": Schema validation Error \n" + JSON.stringify(err)
                        }
                    })
                }
            }
        }
    }
    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}