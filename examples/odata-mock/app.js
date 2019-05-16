#!/usr/bin/env node
'use strict'

const odataMock = require("@varkes/odata-mock")
const app = require('express')()

async function runAsync() {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        app.use(await odataMock.init("./varkes_config.json"))
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