#!/usr/bin/env node

var express = require("express")
var connector = require("./connector")
var apis = require("./apis")
var keys = require("./keys")
//const { parse, convert } = require('odata2openapi');
var request = require("request")
var fs = require("fs")
var LOGGER = require("./logger").logger
var yaml = require('js-yaml');
const path = require("path")
const url = require("url")
const bodyParser = require('body-parser');
const CONFIG = require("./config")
var expressWinston = require('express-winston');

var app = express()
var varkesConfig
var apiType = "openapi";
var nodePort;
var localKyma = false;
const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

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
    app.use("/connection", connector.router)

    app.post("/connection", connect);

    app.get("/app", function (req, res) {
        res.sendFile(path.resolve(__dirname, "views/index.html"))
    })
    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })
    app.post("/events", sendEvent)

    return new Promise(function (resolve, reject) {
        resolve(app)
    });
}

async function connect(req, res) {
    if (!req.body) res.sendStatus(400);

    try {
        data = await connector.connectFunc(req.query.localKyma, req.body.url)

        if (req.query.localKyma == true) {
            var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + nodePort);
        }
        CONFIG.URLs = data
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")

        if (req.body.register) {
            LOGGER.debug("Auto-register APIs")
            var hostname = req.body.hostname || "http://localhost"
            await createServicesFromConfig(hostname, varkesConfig.apis)
            await createEventsFromConfig(varkesConfig.events)
            LOGGER.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        }

        connector.info(req, res)

    } catch (error) {
        message = "There is an error while registering.\n Please make sure that your token is unique"
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.statusCode = 401
        res.send(message)
    }
}

async function createServicesFromConfig(hostname, apisConfig) {
    if (!apisConfig)
        return

    serviceMetadata = defineServiceMetadata()
    for (i = 0; i < apisConfig.length; i++) {
        api = apisConfig[i]
        try {
            await createService(serviceMetadata, api, hostname)
            LOGGER.debug("Registered API successful: %s", api.name)
        } catch (error) {
            LOGGER.error("Registration of API '%s' failed: %s", api.name, error.message)
        }
    }
}

function createService(serviceMetadata, api, hostname) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata.name = api.name;
        serviceMetadata.api.targetUrl = hostname;
        if (api.baseurl)
            serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

        serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + api.oauth;
        apiType = api.apiType;
        if (!apiType || apiType == "openapi") {
            var doc = yaml.safeLoad(fs.readFileSync(api.specification_file, 'utf8'));
            serviceMetadata.api.spec = doc;
            if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("description")) {
                serviceMetadata.description = doc.info.description;
            }
            else if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("title")) {
                serviceMetadata.description = doc.info.title;
            }
            else {
                serviceMetadata.description = api.name;
            }
        }
        else {
            serviceMetadata.description = api.name;
            serviceMetadata.api.specificationUrl = api.metadata;
            serviceMetadata.api.apiType = "odata";
        }
        apis.createAPI(localKyma, serviceMetadata, function (error, httpResponse, body) {
            if (error) {
                reject(error)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        })
    })
}

async function createEventsFromConfig(eventsConfig) {
    if (!eventsConfig)
        return

    eventMetadata = defineEventMetadata()
    for (i = 0; i < eventsConfig.length; i++) {
        event = eventsConfig[i]
        try {
            await createEvent(eventMetadata, event)
            LOGGER.debug("Registered Event API successful: %s", event.name)
        } catch (error) {
            LOGGER.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
        }
    }
}

function createEvent(eventMetadata, event) {
    LOGGER.debug("Auto-register Event API '%s'", event.name)
    return new Promise((resolve, reject) => {
        eventMetadata.name = event.name;
        if (eventMetadata.description) {
            eventMetadata.description = event.description;
        }
        else {
            eventMetadata.description = event.name;
        }
        if (eventMetadata.labels) {
            eventMetadata.labels = event.labels;
        }

        serviceJSON = JSON.parse(fs.readFileSync(event.specification_file))
        eventMetadata.events = serviceJSON;

        apis.createAPI(localKyma, eventMetadata, function (error, httpResponse, body) {
            if (error) {
                reject(error)
            } else {
                if (httpResponse >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        })
    })
}

function sendEvent(req, res) {
    request.post({
        url: CONFIG.URLs.eventsUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: req.body,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, (error, httpResponse, body) => {
        if (error) {
            LOGGER.error("Error while sending Event: %s", error)
            res.status(500).send({ error: error.message })
        } else if (httpResponse.statusCode >= 400) {
            LOGGER.error("Error while sending Event: %s", JSON.stringify(body))
            res.status(httpResponse.statusCode).type("json").send(body)
        } else {
            LOGGER.debug("Received API data: %s", JSON.stringify(body))
            res.status(httpResponse.statusCode).type("json").send(body)
        }
    })
}
function defineServiceMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "ec-mock-service-4",
        "description": "",
        "api": {
            "targetUrl": "http://localhost/target",
            "credentials": {
                "oauth": {
                    "url": "http://localhost/oauth/validate",
                    "clientId": "string",
                    "clientSecret": "string"
                }
            },
            "spec": {}
        }
    }
}
function defineEventMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "",
        "description": "",
        "labels": {
            "connected-app": "myApp"
        },
        "events": {
        }
    }
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