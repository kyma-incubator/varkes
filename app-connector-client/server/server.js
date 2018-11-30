#!/usr/bin/env node

var express = require("express")
var Resource = require("express-resource")
var connector = require("./connector")
var request = require("request")
var fs = require("fs")
var LOGGER = require("./logger")
const path = require("path")
const url = require("url")
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

app.resource('apis', require("./resources/api"))

app.get("/connection", function (req, res) {
    res.send(returnConnectionInfo())
})
app.post("/connection", function (req, res) {
    if (!req.body) res.sendStatus(400);

    connector.exportKeys(req.body.url, (err, data) => {

        if (err) {
            message = "There is an error while registering.\n Please make sure that your token is unique and that you are not using Local Kyma Installation"
            LOGGER.logger.info(message)
            res.statusCode = 401
            res.send(message)
        } else {
            fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")
            CONFIG.URLs = data
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
app.start = function () {
    var server = app.listen(CONFIG.port | 4444, function () {
        var host = server.address().address
        var port = server.address().port

        console.log("App connector listening at http://%s:%s", host, port)

    });
}

function createKeysFromToken(tokenUrl, cb) {
    try {
        connector.exportKeys(tokenUrl, (data) => cb(data))
    } catch (error) {
        console.log(error.message)
    }


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
        response.metadataUrl = CONFIG.URLs.eventsUrl;

        return response

    } else {
        res.statusCode = 404
        res.send("not connected to any cluster")
    }

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
module.exports = function (varkesConfigPath) {
    app.post("/register", (req, res) => {
        if (!req.body) res.sendStatus(400)
        //openssl genrsa -out keys/ec-default.key 2048

        endpointConfig = path.resolve(varkesConfigPath)
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
            res.send(`${endpointsJson.apis.length} apis registered.`)
        })


    })
    return app;
}

if (process.argv.length > 2) {
    var app = module.exports(process.argv[2]);
    app.start();
}
else { // FIXME: I need this for local testing -Atakan
    app.start()
}