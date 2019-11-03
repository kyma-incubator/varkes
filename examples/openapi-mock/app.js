#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const config = require("@varkes/configuration")
const app = require('express')()

let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }
    try {
        app.use(await openapiApp.init(config.resolveFile("./varkes_config.json")))
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