#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const odataApp = require("@varkes/odata-mock")
const connectorApp = require("@varkes/app-connector-client")
const app = require('express')()
var fs = require("fs")
var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }


    var config = defineConfig()
    fs.writeFileSync("./generated/generated_config.json", JSON.stringify(config))
    try {
        app.use(await connectorApp("./generated/generated_config.json"))
        app.use(await odataApp("./generated/generated_config.json"))
        app.use(await openapiApp("./generated/generated_config.json"))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}
function defineConfig() {
    var config = {
        "name": "Stress-Mock",
        "apis": [],
        "events": [
            {
                "specification": "apis/events.json",
                "name": "events",
                "description": "All Events v1",
                "labels": {
                    "label1": "value1"
                }
            }
        ]
    }
    var openapi = {
        "specification": "apis/schools.yaml"
    };
    var odataapi = {
        "specification": "apis/services.xml",
        "type": "odata"
    }
    for (var i = 1; i < 151; i++) {
        openapi.baseurl = "/api" + i;
        openapi.name = "schools" + i;
        config.apis.push(JSON.parse(JSON.stringify(openapi)));
        odataapi.name = "services" + i;
        config.apis.push(JSON.parse(JSON.stringify(odataapi)));
    }
    return config
}
module.exports = runAsync()