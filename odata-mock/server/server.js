#!/usr/bin/env node

var odataApp = require("./app")
var app = require('express')()
var LOGGER = require("./logger").logger
var configPath = "test/varkes_config.js"

if (process.argv.length > 2) {
    configPath = process.argv[2]
}

runAsync = async () => {
    try {
        app.use(await odataApp(configPath))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()
