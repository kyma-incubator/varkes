#!/usr/bin/env node
'use strict'

const odataApp = require("@varkes/odata-mock")
const connectorApp = require("@varkes/app-connector-client")
const app = require('express')()

var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        app.use(await odataApp.init("./varkes_config.json"))
        app.use(await connectorApp.init("./varkes_config.json"))
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