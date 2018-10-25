#!/usr/bin/env node

var express = require("express")
var Resource = require("express-resource")
var connector = require("./connector")
var request = require("request")
var fs = require("fs")
const path = require("path")

const bodyParser = require('body-parser');
const CONFIG = require("../config")

var app = express();
app.use(bodyParser.json());
//Get APi data from api.json if exists. We can move this code to somewhere else.
if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
    CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
} else {
    require("../prestart").generatePrivateKey()
}
app.use(express.static(path.resolve(__dirname, 'views/')))
require("./middleware").defineMW(app)

app.resource('services', require("./resources/service"))

app.post(CONFIG.startConnUrl, function (req, res) {
    if (!req.body) res.sendStatus(400);

    connector.exportKeys(req.body.url, (data) => {

        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")
        res.send(data)
        CONFIG.URLs = data
    })
});

app.get("/ui/services", function (req, res) {
    res.sendfile(path.resolve(__dirname, "views/index.html"))
})

app.get("/metadata", function (req, res) {
    res.sendfile("swagger.yaml")
})

app.get("/connector", function (req, res) {
    res.sendfile(path.resolve(__dirname, "views/connector.html"))
})
app.post("/register", (req, res) => {
    if (!req.body) res.sendStatus(400)
    //openssl genrsa -out keys/ec-default.key 2048

    endpointConfig = path.resolve("varkes.config.json")
    var endpointsJson = JSON.parse(fs.readFileSync(endpointConfig))
    console.log(endpointsJson)
    var token = req.body.token
    var hostname = req.body.hostname || "http://localhost"

    createKeysFromToken(token, urls => {
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(urls), "utf8")

        CONFIG.URLs = urls
        console.log(urls)
        keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
            , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')


        createServicesFromConfig(hostname, endpointsJson)
        res.send(`${endpointsJson.apis.length} services registered.`)
    })


})
var server = app.listen(CONFIG.port, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("App connector listening at http://%s:%s", host, port)

});

function createKeysFromToken(tokenUrl, cb) {

    connector.exportKeys(tokenUrl, (data) => cb(data))
}

function createServicesFromConfig(hostname, endpoints) {

    createSingleService(hostname, endpoints, 0)
}


function createSingleService(hostname, endpoints, endpointCount) {
    serviceMetadata = defineServiceMetadata()
    var element = endpoints.apis[endpointCount]
    serviceMetadata.name = endpoints.name + "-" + Math.random().toString(36).substring(2, 5);
    serviceMetadata.api.targetUrl = hostname + element.baseurl


    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {
        console.log(body)

        if (endpointCount + 1 < endpoints.apis.length) {
            createSingleService(hostname, endpoints, endpointCount + 1)
        }
    });
}


function defineServiceMetadata() {
    return {
        "provider": "aY",
        "name": "ec-mock-service-4",
        "description": "testing... 1.2.3.",
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
        },

        "documentation": {
            "displayName": "string",
            "description": "string",
            "type": "string",
            "tags": [
                "string"
            ],
            "docs": [
                {
                    "title": "string",
                    "type": "string",
                    "source": "string"
                }
            ]
        }
    }
}
module.exports = server