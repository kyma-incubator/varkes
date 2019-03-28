#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const odataApp = require("@varkes/odata-mock")
const connectorApp = require("@varkes/app-connector-client")
const app = require('express')()
var fs = require("fs")

const OPENAPI_COUNT = process.env.OPENAPI ? parseInt(process.env.OPENAPI) : 100;
const ODATA_COUNT = process.env.ODATA ? parseInt(process.env.ODATA) : 100;
const EVENT_COUNT = process.env.EVENT ? parseInt(process.env.EVENT) : 100;

var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    var config = generateConfig()
    if (!fs.existsSync("./generated/")) {
        fs.mkdirSync("./generated/");
    }
    fs.writeFileSync("./generated/varkes_config.json", JSON.stringify(config, null, 2))
    try {
        app.use(await connectorApp.init("./generated/varkes_config.json", __dirname))
        app.use(await odataApp.init("./generated/varkes_config.json", __dirname))
        app.use(await openapiApp.init("./generated/varkes_config.json", __dirname))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d with %d OpenAPIs, %d ODatas and %d Events", port, OPENAPI_COUNT, ODATA_COUNT, EVENT_COUNT)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

function generateConfig() {
    var config = {
        name: "Stress-Mock",
        apis: [],
        events: []
    }

    for (var i = 1; i < OPENAPI_COUNT + 1; i++) {
        config.apis.push({
            baseurl: "/api" + i + "/v1",
            name: "OpenAPI " + i,
            type: "openapi",
            specification: "../apis/schools.yaml"
        })
    }
    for (var i = 1; i < ODATA_COUNT + 1; i++) {
        config.apis.push({
            name: "OData " + i,
            specification: "../apis/services.xml",
            basepath: "/api" + i +"/odata",
            type: "odata"
        })
    }
    for (var i = 1; i < EVENT_COUNT + 1; i++) {
        config.events.push({
            name: "Event " + i,
            specification: "../apis/events.json"
        })
    }
    return config
}
module.exports = runAsync()