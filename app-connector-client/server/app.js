#!/usr/bin/env node
'use strict'

const config = require('./config.js')
const express = require("express")
const fs = require("fs")
const LOGGER = require("./logger").logger
const path = require("path")
const bodyParser = require('body-parser');
const CONFIG = require("./config.json")
const expressWinston = require('express-winston');
const connector = require("./routes/connector");
const events = require("./routes/events")
var apis = require("./routes/apis")
var keys = require("./keys")
const check_api = require('check_api');
const yaml = require('js-yaml');
var app = express()
var varkesConfig

module.exports = function (varkesConfigPath = null, nodePortParam = null) {
    var app = express()
    app.use(bodyParser.json());
    var varkesConfig = config(varkesConfigPath)
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
    } else {
        keys.generatePrivateKey()
    }

    app.use(expressWinston.logger(LOGGER))

    app.use("/apis", apis.router())
    app.use("/connection", connector.router(varkesConfig, nodePortParam))
    app.use("/events", events.router())

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views/'));
    app.use(express.static(path.resolve(__dirname, 'views/static/')))
    app.get("/", function (req, res) {
        res.render('index', { appName: varkesConfig.name })
    })

    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })

    return new Promise(function (resolve, reject) {
        resolve(app)
    });
}

function configValidation(configJson) {
    var error_message = "";

    var events = configJson.events;
    if (events) {
        for (var i = 1; i <= events.length; i++) {
            {
                var event = events[i - 1];
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
                if (!event.name) {
                    error_message += "\nevent number " + i + ": missing attribute 'name', a name is mandatory";
                }
                if (!event.specification) {
                    error_message += "\nevent '" + event.name + "': missing attribute 'specification', a specification is mandatory";
                }
                if (!event.specification.match(/^.+\.(json|yaml|yml)$/)) {
                    error_message += "\nevent '" + event.name + "': specification '" + event.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'";
                }
            }
        }
    }
    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}
