#!/usr/bin/env node
var serviceResource = require("./resources/api");
var express = require("express")
var Resource = require("express-resource")
var connector = require("./connector")
//const { parse, convert } = require('odata2openapi');
var request = require("request")
var fs = require("fs")
var LOGGER = require("./logger")
var yaml = require('js-yaml');
const path = require("path")
const url = require("url")
const bodyParser = require('body-parser');
const CONFIG = require("../config")
var odata = false;
var node_port;
var localKyma = false;
module.exports = function (appStart, varkesConfigPath, odata_param = false, node_port_var) {
    node_port = node_port_var;
    odata = odata_param;
    app = appStart;
    app.use(bodyParser.json());
    endpointConfig = path.resolve(varkesConfigPath)
    var endpointsJson = require(endpointConfig)
    if (!configValidation(endpointsJson, odata)) {
        return;
    }
    app.post("/register", (req, res) => {
        if (!req.body) res.sendStatus(400)
        //openssl genrsa -out keys/ec-default.key 2048


        var token = req.body.token
        var hostname = req.body.hostname || "http://localhost"
        if (req.query.localKyma == true)
            localKyma = true;
        createKeysFromToken(localKyma, token, urls => {
            console.log("createKeysFromToken")

            if (urls) {
                fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(urls), "utf8")
                CONFIG.URLs = urls
                console.log("urls")
                console.log(urls)
            }
            keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
                , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')


            createServicesFromConfig(hostname, endpointsJson)
            var events = endpointsJson.events;
            if (events) {
                events.forEach(function (event) {
                    var eventMetadata = defineEventMetadata();
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
                    registerServices(eventMetadata, event.specification_file)

                })
            }


            res.send(`${endpointsJson.apis.length} apis registered.`)
        })


    })
    app.get('/title', function (req, res, next) {
        res.statusCode = 200
        certificates_exist = false;

        if (fs.existsSync(path.resolve(CONFIG.keyDir, "kyma.crt")) &&
            fs.existsSync(path.resolve(CONFIG.keyDir, "test.csr"))) {
            certificates_exist = true;
        }


        res.send({ name: endpointsJson.name, cert_exist: certificates_exist, eventsUrl: CONFIG.URLs.eventsUrl, metadataUrl: CONFIG.URLs.metadataUrl });
    })
    app.get('/download/cert', function (req, res, next) {
        var file = path.resolve(CONFIG.keyDir, 'kyma.crt')
        res.download(file);
    });
    app.get('/download/key', function (req, res, next) {
        var file = path.resolve(CONFIG.keyDir, 'ec-default.key')
        res.download(file);
    });
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
        keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
            , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')
    } else {
        require("../prestart").generatePrivateKey()
    }
    app.use(express.static(path.resolve(__dirname, 'views/')))
    require("./middleware").defineMW(app)

    app.resource('apis', require("./resources/api"))

    app.get("/connection", function (req, res) {
        res.send(returnConnectionInfo())
    })
    app.post("/connection", function (req, res) {
        if (!req.body) res.sendStatus(400);

        connector.exportKeys(req.query.localKyma, req.body.url, (err, data) => {

            if (err) {
                message = "There is an error while registering.\n Please make sure that your token is unique"
                LOGGER.logger.error(message)
                res.statusCode = 401
                res.send(message)
            } else {
                if (req.query.localKyma == true) {
                    localKyma = true;
                    var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
                    data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + node_port);
                }
                CONFIG.URLs = data
                fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")
                res.send(returnConnectionInfo())

            }
        })




    });

    app.get("/ui/apis", function (req, res) {
        res.sendfile(path.resolve(__dirname, "views/index.html"))
    })
    app.get("/ui/events", (req, res) => {
        res.sendFile(path.resolve(__dirname, "views/events.html"))
    })
    app.get("/metadata", function (req, res) {
        res.sendfile("swagger.yaml")
    })

    app.get("/certificates/private-key", (req, res) => {
        const keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
        res.download(keyFile)


    })

    app.post("/sendevent", (req, res) => {
        console.log(req.body)
        sendEvent(req.body, (data) => {
            res.send(data)
        })
    })
    app.get("/certificates/kyma-cert", (req, res) => {
        const certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')
        res.download(certFile)
    })
    app.get("/connector", function (req, res) {
        res.sendfile(path.resolve(__dirname, "views/connector.html"))
    })
    let server
    app.start = function () {
        server = app.listen(4440, function () {
            var host = server.address().address
            var port = server.address().port

            console.log("App connector listening at http://%s:%s", host, port)

        });
    }
    return app;
}
//Get APi data from api.json if exists. We can move this code to somewhere else.

function createKeysFromToken(localKyma, tokenUrl, cb) {
    try {
        connector.exportKeys(localKyma, tokenUrl, (data) => cb(data))
    } catch (error) {
        console.log(error.message)
    }


}

function registerServices(metaData, jsonPath) {
    serviceJSON = JSON.parse(fs.readFileSync(jsonPath))
    console.log(serviceJSON)
    metaData.events = serviceJSON;
    serviceResource.createService(false, metaData, (data) => console.log(data))
}

function createServicesFromConfig(hostname, endpoints) {

    createSingleService(hostname, endpoints, 0)
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
function createSingleService(hostname, endpoints, endpointCount) {
    serviceMetadata = defineServiceMetadata()
    var element = endpoints.apis[endpointCount]
    serviceMetadata.name = element.name;
    serviceMetadata.api.targetUrl = hostname;
    if (element.baseurl)
        serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + element.baseurl;

    serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + element.oauth;
    if (!odata) {
        var doc = yaml.safeLoad(fs.readFileSync(element.specification_file, 'utf8'));
        serviceMetadata.api.spec = doc;
        if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("description")) {
            serviceMetadata.description = doc.info.description;
        }
        else if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("title")) {
            serviceMetadata.description = doc.info.title;
        }
        else {
            serviceMetadata.description = element.name;
        }
    }
    else {
        //var data = fs.readFileSync(element.specification_file, "utf8");
        serviceMetadata.description = element.name;
        //serviceMetadata.api.spec = data;
        serviceMetadata.api.specificationUrl = element.metadata;
        serviceMetadata.api.apiType = "odata";
    }


    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {
        console.log(body)

        if (endpointCount + 1 < endpoints.apis.length) {
            createSingleService(hostname, endpoints, endpointCount + 1)
        }
    });
}

function sendEvent(event, cb) {
    request.post({
        url: CONFIG.URLs.eventsUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: event,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, (error, httpResponse, body) => {
        console.log(body)
        cb(body)
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
            "connected-app": "ec-default"
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
    else {
        error_message = "no apis array exist";
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

if (process.argv.length > 2) {
    var app = express()
    let node_port
    if (process.argv.length > 3) {
        node_port = process.argv[3]
    }

    app = module.exports(app, process.argv[2], node_port)

    if (app) {
        app.start();
    }

}
// else { // FIXME: I need this for local testing -Atakan
//     app.start()
// }