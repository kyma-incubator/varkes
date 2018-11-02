#!/usr/bin/env node

const program = require("commander")
const request = require("request")
const connector = require("./server/connector")
const fs = require("fs")
var CONFIG = require("./config")
const path = require("path")
console.log("CLI for Varkes App Connector")


program
    .version("0.0.1")
    .option('--token [tokenUrl]', "connect token for RE", '')
    .option('--input [inputFile]', "file to register with app-connector-client", 'varkes.config.json')
    .option("--hostname [hostname]", "public address of the running container", 'http://localhost')
    .parse(process.argv)


let keyFile, certFile

require("./prestart").generatePrivateKey() //openssl genrsa -out keys/ec-default.key 2048


const programToken = program.token;
const endpointConfig = path.resolve(program.input)
const hostname = program.hostname
console.log(
    {
        token: programToken,
        endpointConfig: endpointConfig,
        hostname: hostname
    }
)
var serviceMetadata = defineServiceMetadata()

if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) { //no need for token
    urls = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), "utf-8"))

    CONFIG.URLs = urls
    console.log(urls)
    keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
        , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

    createServicesFromConfig(hostname, JSON.parse(fs.readFileSync(endpointConfig)))

}
else {
    createKeysFromToken(programToken, urls => {
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(urls), "utf8")

        CONFIG.URLs = urls
        console.log(urls)
        keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
            , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

        createServicesFromConfig(hostname, JSON.parse(fs.readFileSync(endpointConfig)))

    })
}

function createKeysFromToken(tokenUrl, cb) {

    connector.exportKeys(tokenUrl, (data) => cb(data))
}

function createServicesFromConfig(hostname, endpoints) {

    createSingleService(hostname, endpoints, 0)
}


function createSingleService(hostname, endpoints, endpointCount) {

    var element = endpoints.apis[endpointCount]
    serviceMetadata.name = endpoints.name + "-" + Math.random().toString(36).substring(2, 5);
    serviceMetadata.api.targetUrl = hostname + element.baseurl
    serviceMetadata.api.credentials.oauth.url = hostname + element.oauth


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
        "events": {
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