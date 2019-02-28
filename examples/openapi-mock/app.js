#!/usr/bin/env node
'use strict'

const openapiApp = require("varkes-openapi-mock")
const app = require('express')()

var runAsync = async () => {
    var port
    if (process.argv.length > 2) {
        port = process.argv[2]
    }
    try {
        app.use(await openapiApp("./varkes_config.json"))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()