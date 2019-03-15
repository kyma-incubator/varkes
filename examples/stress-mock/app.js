#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const odataApp = require("@varkes/odata-mock")
const connectorApp = require("@varkes/app-connector-client")
const app = require('express')()
var fs = require("fs")
const OPEN_API_LOOP_COUNT = 151;
const ODATA_LOOP_COUNT = 151;
const EVENT_LOOP_COUNT = 11;
var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }


    var config = generateConfig()
    if (!fs.existsSync("./generated/")) {
        fs.mkdirSync("./generated/");
    }
    fs.writeFileSync("./generated/varkes_config.json", JSON.stringify(config))
    try {
        app.use(await connectorApp("./generated/varkes_config.json"))
        app.use(await odataApp.init("./generated/varkes_config.json"))
        app.use(await openapiApp("./generated/varkes_config.json"))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}
function generateConfig() {
    var config = {
        "name": "Stress-Mock",
        "apis": [],
        "events": []
    }
    var openapi = {
        "specification": "apis/schools.yaml",
        "authtype": "basic",
    };
    var odataapi = {
        "specification": "apis/services.xml",
        "authtype": "basic",
        "type": "odata"
    }
    var event = {
        "specification": "apis/events.json",
        "description": "All Events v1",
        "labels": {
            "label1": "value1"
        }
    }

    for (var i = 1; i < OPEN_API_LOOP_COUNT; i++) {
        openapi.baseurl = "/api" + i;
        openapi.name = "schools" + i;
        config.apis.push(JSON.parse(JSON.stringify(openapi)));
        odataapi.name = "services" + i;
        config.apis.push(JSON.parse(JSON.stringify(odataapi)));
    }
    for (var i = 1; i < ODATA_LOOP_COUNT; i++) {
        odataapi.name = "services" + i;
        config.apis.push(JSON.parse(JSON.stringify(odataapi)));
    }
    for (var i = 1; i < EVENT_LOOP_COUNT; i++) {
        event.name = "event" + i;
        config.events.push(JSON.parse(JSON.stringify(event)));
    }
    return config
}
module.exports = runAsync()