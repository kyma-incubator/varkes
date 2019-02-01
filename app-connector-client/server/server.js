#!/usr/bin/env node

var connectorApp = require("./app")
var app = require('express')()
var LOGGER = require("./logger").logger
var nodePort
var configPath = "test/varkes_config.json"

if (process.argv.length > 2) {
    configPath = process.argv[2]
    if (process.argv.length > 3) {
        nodePort = process.argv[3]
    }
}

runAsync = async () => {
    try {
        app.use(await connectorApp(configPath))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()
