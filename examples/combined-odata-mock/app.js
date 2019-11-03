#!/usr/bin/env node
'use strict'

const odataApp = require("@varkes/odata-mock")
const cockpitApp = require("@varkes/cockpit");
const connectorApp = require("@varkes/api-server")
const config = require("@varkes/configuration")
const app = require('express')()

let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        let configuration = config.resolveFile("./varkes_config.json")
        app.use(await odataApp.init(configuration))
        app.use(await connectorApp.init(configuration))
        app.use(await cockpitApp.init(configuration))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            })
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

module.exports = runAsync()