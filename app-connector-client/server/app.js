#!/usr/bin/env node

var express = require("express")
var connector = require("./connector")
var apis = require("./api")
var keys = require("./keys")
//const { parse, convert } = require('odata2openapi');
var request = require("request")
var fs = require("fs")
var LOGGER = require("./logger")
var yaml = require('js-yaml');
const path = require("path")
const url = require("url")
const bodyParser = require('body-parser');
const CONFIG = require("./config")

var varkesConfig
var odata = false;
var nodePort;
var localKyma = false;

module.exports = function (varkesConfigPath = null, appParam = null, odataParam = false, nodePortParam = null) {
    nodePort = nodePortParam;
    odata = odataParam;
    if (appParam) {
        app = appParam;
    } else {
        app = express()
    }
    app.use(bodyParser.json());

    if (varkesConfigPath) {
        endpointConfig = path.resolve(varkesConfigPath)
        varkesConfig = require(endpointConfig)
        if (!configValidation(varkesConfig, odata)) {
            return;
        }
    } else {
        varkesConfig = {
            name: 'Varkes',
            apis: [],
            event_spec_path: ''
        }
    }

    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
        keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
        certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
    }else {
        keys.generatePrivateKey()
    }

    require("./middleware").defineMW(app)

    app.get('/title', function (req, res, next) {
        res.statusCode = 200
        certificates_exist = false;

        if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile)) &&
            fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))) {
            certificates_exist = true;
        }

        res.send({
            name: varkesConfig.name,
            cert_exist: certificates_exist,
            eventsUrl: CONFIG.URLs.eventsUrl,
            metadataUrl: CONFIG.URLs.metadataUrl
        });
    })

    app.use(express.static(path.resolve(__dirname, 'views/')))

    app.get("/apis", apis.getAll)
    app.post("/apis", apis.create)
    app.delete("/apis", apis.deleteAll)

    app.get("/apis/:api", apis.get)
    app.put("/apis/:api", apis.update)
    app.delete("/apis/:api", apis.delete)

    app.get("/connection", function (req, res) {
        res.send(returnConnectionInfo())
    })
    app.post("/connection", connect);

    app.get("/connection/key", (req, res) => {
        const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
        res.download(keyFile)
    })

    app.get("/connection/cert", (req, res) => {
        const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
        res.download(certFile)
    })

    app.get("/app", function (req, res) {
        res.sendFile(path.resolve(__dirname, "views/index.html"))
    })
    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/swagger.yaml"))
    })

    app.post("/events", sendEvent)

    let server
    app.start = function () {
        server = app.listen(CONFIG.port, function () {
            var host = server.address().address
            var port = server.address().port

            LOGGER.logger.info("App connector listening at http://%s:%s", host, port)

        });
    }
    return app;
}

async function connect(req, res) {
    if (!req.body) res.sendStatus(400);

    try {
        data = await connector.connect(req.query.localKyma, req.body.url)

        if (req.query.localKyma == true) {
            var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + nodePort);
        }
        CONFIG.URLs = data
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")

        if (req.body.register) {
            LOGGER.logger.debug("Auto-register APIs")
            var hostname = req.body.hostname || "http://localhost"
            await createServicesFromConfig(hostname, varkesConfig.apis)
            await createEventsFromConfig(varkesConfig.events)
            LOGGER.logger.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        }

        res.send(returnConnectionInfo())
    } catch (error) {
        message = "There is an error while registering.\n Please make sure that your token is unique"
        LOGGER.logger.error(message)
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
            LOGGER.logger.debug("Registered API successful: %s", api.name)
        } catch (error) {
            LOGGER.logger.error("Registration of API '%s' failed: %s", api.name, error)
        }
    }
}

function createService(serviceMetadata, api, hostname) {
    LOGGER.logger.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata.name = api.name;
        serviceMetadata.api.targetUrl = hostname;
        if (api.baseurl)
            serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

        serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + api.oauth;
        if (!odata) {
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

        apis.createAPI(localKyma, serviceMetadata, function (data, err) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
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
            LOGGER.logger.debug("Registered Event API successful: %s", event.name)
        } catch (error) {
            LOGGER.logger.error("Registration of Event API '%s' failed: %s", event.name, JSON.stringify(error))
        }
    }
}

function createEvent(eventMetadata, event) {
    LOGGER.logger.debug("Auto-register Event API '%s'", event.name)
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

        apis.createAPI(localKyma, eventMetadata, function (data, err) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function returnConnectionInfo() {
    if (CONFIG.URLs.metadataUrl !== "") {
        const myURL = new url.URL(CONFIG.URLs.metadataUrl)
        response = {
            "cluster_domain": "",
            "re_name": "",
            "eventsUrl": "",
            "metadataUrl": ""
        }
        response.cluster_domain = myURL.hostname.split(".")[1]
        response.re_name = myURL.pathname.split("/")[1]
        response.eventsUrl = CONFIG.URLs.eventsUrl;
        response.metadataUrl = CONFIG.URLs.metadataUrl;

        return response

    } else {
        res.statusCode = 404
        res.send("not connected to any cluster")
    }

}

function sendEvent (req, res)  {
    request.post({
        url: CONFIG.URLs.eventsUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: evreq.body,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, (error, httpResponse, body) => {
        res.send(body)
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

function configValidation(configJson, odata) {
    var error_message = "";
    if (configJson.hasOwnProperty("apis")) {
        var apis = configJson.apis;
        var matchRegex = /^(\/[a-zA-Z0-9]+)+$/
        for (var i = 1; i <= apis.length; i++) {
            var api = apis[i - 1];
            if ((!api.baseurl || !api.baseurl.match(matchRegex)) && !odata) {
                error_message += "\napi number " + i + ": baseurl does not exist or is in the wrong format";
            }
            if (!api.metadata || !api.metadata.match(matchRegex)) {
                error_message += "\napi number " + i + ": metadata does not exist or is in the wrong format";
            }
            if (!api.name || !api.name.match(/[a-zA-Z0-9]+/)) {
                error_message += "\napi number " + i + ": name does not exist or is in the wrong format";
            }
            if ((!api.oauth || !api.oauth.match(matchRegex)) && !odata) {
                error_message += "\napi number " + i + ": oauth does not exist or is in the wrong format";
            }
            if ((!api.specification_file || !api.specification_file.match(/[a-zA-Z0-9]+.yaml/)) && !odata) {
                error_message += "\napi number " + i + ": specification_file does not exist or is not a yaml file";
            }
            if ((!api.specification_file || !api.specification_file.match(/[a-zA-Z0-9]+.xml/)) && odata) {
                error_message += "\napi number " + i + ": specification_file does not exist or is not a xml file";
            }
        }
    }

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
        console.log("=======Config Error========" + error_message);
        return false;
    }

    return true;
}