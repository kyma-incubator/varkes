#!/usr/bin/env node

var express = require("express")


var fs = require("fs")
var LOGGER = require("./logger").logger
const path = require("path")
const bodyParser = require('body-parser');
const CONFIG = require("./config")
var expressWinston = require('express-winston');

//route definitions
const events = require("./routes/events")
var connector = require("./routes/connector")
var apis = require("./routes/apis")
var keys = require("./keys")

var app = express()
var varkesConfig



module.exports = function (varkesConfigPath = null, nodePortParam = null) {
    nodePort = nodePortParam;

    app.use(bodyParser.json());

    if (varkesConfigPath) {
        endpointConfig = path.resolve(varkesConfigPath)
        LOGGER.info("Using configuration %s", endpointConfig)
        varkesConfig = require(endpointConfig)
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
    app.use(express.static(path.resolve(__dirname, 'views/')))

    app.use("/apis", apis)
    app.use("/connection", connector) //* in the routes folder


    app.get("/app", function (req, res) {
        res.sendFile(path.resolve(__dirname, "views/index.html"))
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
                if (!event.name || !event.name.match(/[a-zA-Z0-9]+/)) {
                    error_message += "\nevent number " + i + ": name does not exist or is in the wrong format";
                }
                if ((!event.specification_file || !event.specification_file.match(/[a-zA-Z0-9]+.json/))) {
                    error_message += "\nevent number " + i + ": specification_file does not exist or is not a json file";
                }
            }
        }
    }
    if (error_message != "") {
        throw new Error("Config Error: " + error_message);
    }
}