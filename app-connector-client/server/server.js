#!/usr/bin/env node
'use strict'

const connectorApp = require("./app")
const app = require('express')()
const LOGGER = require("./logger").logger
var configPath

var runAsync = async () => {

    if (process.argv.length > 2) {
        configPath = process.argv[2]
        if (process.argv.length > 3) {
            nodePort = process.argv[3]
        }
    }

    try {
        app.use(await connectorApp.init(configPath, __dirname))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        })
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error.stack)
    }
}

runAsync()
