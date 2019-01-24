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
    app.set('view engine', 'ejs'); //* using EJS as template engine
    app.set('views', path.join(__dirname, '/views/'));
    app.use(express.static(path.resolve(__dirname, 'views/static/')))

    app.use("/apis", apis)
    app.use("/connection", connector) //* in the routes folder

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
                if (!event.name) {
                    error_message += "\nevent number " + i + ": missing attribute 'name', a name is mandatory";
                }
                if (!event.name.match(/^[\w]+$/)) {
                    error_message += "\nevent " + event.name + ": name " + event.name + " contains non-alphanumeric letters, please remove them";
                }
                if (!event.specification_file) {
                    error_message += "\nevent " + event.name + ": missing attribute 'specification_file', a specification_file is mandatory";
                }
                if (!event.specification_file.match(/^[/\\\w]+.json$/)) {
                    error_message += "\nevent " + event.name + ": specification_file " + event.specification_file + " does not match pattern '^[/\\\w]+.json$'";
                }
            }
        }
    }
    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}