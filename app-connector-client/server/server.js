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
var node_port = 31441;
var app = express();
var localKyma = false;
app.use(bodyParser.json());
//Get APi data from api.json if exists. We can move this code to somewhere else.
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
            message = "There is an error while registering.\n Please make sure that your token is unique and that you are not using Local Kyma Installation"
            LOGGER.logger.error(message)
            res.statusCode = 401
            res.send(message)
        } else {
            if (req.query.localKyma == true) {
                console.log("local kyma is true")
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
app.start = function () {
    var server = app.listen(CONFIG.port | 4444, function () {
        var host = server.address().address
        var port = server.address().port

        console.log("App connector listening at http://%s:%s", host, port)

    });
}

function createKeysFromToken(localKyma, tokenUrl, cb) {
    try {
        connector.exportKeys(localKyma, tokenUrl, (data) => cb(data))
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
function configValidation(configJson) {
    var error_message = "";
    if (configJson.hasOwnProperty("apis")) {
        var apis = configJson.apis;
        var matchRegex = /^(\/[a-zA-Z0-9]+)+$/
        for (var i = 1; i <= apis.length; i++) {
            var api = apis[i - 1];
            if (!api.baseurl || !api.baseurl.match(matchRegex)) {
                error_message += "api number " + i + ": baseurl does not exist or is in the wrong format\n";
            }
            if (!api.metadata || !api.metadata.match(matchRegex)) {
                error_message += "api number " + i + ": metadata does not exist or is in the wrong format\n";
            }
            if (!api.name || !api.name.match(/[a-zA-Z0-9]+/)) {
                error_message += "api number " + i + ": name does not exist or is in the wrong format\n";
            }
            if (!api.oauth || !api.oauth.match(matchRegex)) {
                error_message += "api number " + i + ": oauth does not exist or is in the wrong format\n";
            }
            if (!api.specification_file || !api.specification_file.match(/[a-zA-Z0-9]+.yaml/)) {
                error_message += "api number " + i + ": specification_file does not exist or is not a yaml file\n";
            }
        }
    }
    if (error_message != "") {
        console.log("=======Config Error========");
        LOGGER.logger.error(error_message);
        return false;
    }

    return true;
}
module.exports = function (varkesConfigPath) {
    endpointConfig = path.resolve(varkesConfigPath)
    var endpointsJson = require(endpointConfig)
    if (!configValidation(endpointsJson)) {
        return;
    }
    app.post("/register", (req, res) => {
        if (!req.body) res.sendStatus(400)
        //openssl genrsa -out keys/ec-default.key 2048


        console.log(endpointsJson)
        var token = req.body.token
        console.log("token")
        console.log(token)
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
            res.send(`${endpointsJson.apis.length} apis registered.`)
        })


    })
    app.get('/title', function (req, res, next) {
        res.statusCode = 200
        res.send(endpointsJson.name);
    })
    app.get('/download/cert', function (req, res, next) {
        var file = path.resolve(CONFIG.keyDir, 'kyma.crt')
        res.download(file);
    });
    app.get('/download/key', function (req, res, next) {
        var file = path.resolve(CONFIG.keyDir, 'ec-default.key')
        res.download(file);
    });
    return app;
}

if (process.argv.length > 2) {
    var app = module.exports(process.argv[2]);
    if (app) {
        app.start();
    }

}
// else { // FIXME: I need this for local testing -Atakan
//     app.start()
// }