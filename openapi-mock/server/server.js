#!/usr/bin/env node
'use strict'

var openapiApp = require("./app")
var app = require('express')()
var LOGGER = require("./logger").logger
var configPath //= "test/varkes_config.json"

if (process.argv.length > 2) {
    configPath = process.argv[2]
}

var runAsync = async () => {
    try {
        app.use(await openapiApp(configPath))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()