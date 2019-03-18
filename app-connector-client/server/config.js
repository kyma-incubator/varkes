#!/usr/bin/env node
'use strict'

const path = require("path")
const fs = require('fs');
const LOGGER = require("./logger").logger
const check_api = require('check_api');
const yaml = require('js-yaml');
const pretty_yaml = require('json-to-pretty-yaml');

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
    var apis = configJson.apis
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
                            error_message += "\nevent " + event.name + ": Schema validation Error \n" + pretty_yaml.stringify(err)
                        }
                    })
                }
            }
        }
    }
    if (apis) {
        for (var i = 1; i <= apis.length; i++) {
            {
                var api = apis[i - 1];

                if (api.auth && !(api.auth == "oauth" || api.auth == "none" || api.auth == "basic")) {
                    error_message += "\napi " + (api.name ? api.name : "number " + i) + ": attribute 'authtype' should be one of three values [oauth, basic, none]";
                }

            }
        }
    }
    if (configJson.logo && !configJson.logo.match(/^.+\.(svg)$/)) {
        error_message += "\nlogo image must be in svg format"
    }
    if (error_message != "") {

        throw new Error("Validation of configuration failed: " + error_message);
    }
}