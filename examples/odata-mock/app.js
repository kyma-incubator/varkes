#!/usr/bin/env node
'use strict'

const odataApp = require("varkes-odata-mock")
const app = require('express')()

var runAsync = async () => {
    var port
    if (process.argv.length > 2) {
        port = process.argv[2]
    }

    try {
        app.use(await odataApp("./varkes_config.json"))
        if (port)
            app.listen(10000, function () {
                console.info("Started application on port %d", 10000)
            });
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()