#!/usr/bin/env node
'use strict'

const odataApp = require("./app")
const app = require('express')()
const LOGGER = require("./logger").logger

var configPath

var runAsync = async () => {
    if (process.argv.length > 2) {
        configPath = process.argv[2]
    }
    
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
