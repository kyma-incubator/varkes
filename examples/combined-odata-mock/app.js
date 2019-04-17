#!/usr/bin/env node
'use strict'

const odataApp = require("@varkes/odata-mock")
const cockpitApp = require("@varkes/cockpit");
const connectorApp = require("@varkes/app-connector-client")
const app = require('express')()
const cors = require("cors")
var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        app.use(await odataApp.init("./varkes_config.json"))
        app.use(await connectorApp.init("./varkes_config.json"))
        app.use(await cockpitApp.init())
        app.use(cors())
        app.options('*', cors())
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