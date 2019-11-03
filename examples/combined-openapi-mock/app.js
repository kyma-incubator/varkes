#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const connectorApp = require("@varkes/api-server")
const cockpitApp = require("@varkes/cockpit");
const config = require("@varkes/configuration")
const app = require('express')()

let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        let configuration = config.resolveFile("./varkes_config.json")
        app.use(await openapiApp.init(configuration))
        app.use(await connectorApp.init(configuration))
        app.use(await cockpitApp.init(configuration))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error.stack)
    }
}

module.exports = runAsync()