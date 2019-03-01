#!/usr/bin/env node

var express = require("express")
var fs = require("fs")
var LOGGER = require("./logger").logger
const path = require("path")
const bodyParser = require('body-parser');
const CONFIG = require("./app-connector-config.json")
var expressWinston = require('express-winston');
var connectorModule = require("./routes/connector");
const events = require("./routes/events")
var apis = require("./routes/apis")
var keys = require("./keys")
const check_api = require('check_api');
const yaml = require('js-yaml');
var app = express()
var varkesConfig

module.exports = function (varkesConfigPath = null, nodePortParam = null) {
    nodePort = nodePortParam;
    app.use(bodyParser.json());

    if (varkesConfigPath) {
        endpointConfig = path.resolve(varkesConfigPath);
        LOGGER.info("Using configuration %s", endpointConfig);
        varkesConfig = require(endpointConfig);
        configValidation(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/defaultConfig.json", "utf-8"))
    }

    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
    } else {
        keys.generatePrivateKey()
    }

    app.use(expressWinston.logger(LOGGER))
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views/'));
    app.use(express.static(path.resolve(__dirname, 'views/static/')))

    app.use("/apis", apis)
    app.use("/connection", connectorModule(varkesConfig, nodePortParam))

    app.get("/", function (req, res) {
        res.render('index', { appName: varkesConfig.name })
    })
    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })
    app.post("/events", events.sendEvent)

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