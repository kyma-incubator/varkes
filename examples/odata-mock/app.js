#!/usr/bin/env node
'use strict'

const mock = require("@kyma-incubator/varkes-odata-mock")
const config = require("@kyma-incubator/varkes-configuration")
const app = require('express')()

async function runAsync() {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        let configuration = await config.resolveFile("./varkes_config.json")
        app.use(await mock.init(configuration))
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
