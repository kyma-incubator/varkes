#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const connectorApp = require("@varkes/api-server")
const cockpitApp = require("@varkes/cockpit");
const app = require('express')()
var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        app.use(await openapiApp.init("./varkes_config.json"))
        app.use(await connectorApp.init("./varkes_config.json"))
        app.use(await cockpitApp.init())
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

module.exports = runAsync()