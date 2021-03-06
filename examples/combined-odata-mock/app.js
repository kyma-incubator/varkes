#!/usr/bin/env node
'use strict'

const mock = require("@varkes/odata-mock")
const cockpit = require("@varkes/cockpit");
const server = require("@varkes/api-server")
const config = require("@varkes/configuration")
const app = require('express')()

let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        let configuration = await config.resolveFile("./varkes_config.json")
        app.use(await cockpit.init(configuration))
        app.use(await server.init(configuration))
        app.use(await mock.init(configuration))
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
