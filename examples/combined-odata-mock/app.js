#!/usr/bin/env node
'use strict'

const odataApp = require("@varkes/odata-mock")
const cockpitApp = require("@varkes/cockpit");
const connectorApp = require("@varkes/api-server")
const app = require('express')()
let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        app.use(await odataApp.init("./varkes_config.json"))
        app.use(await connectorApp.init("./varkes_config.json"))
        app.use(await cockpitApp.init())
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