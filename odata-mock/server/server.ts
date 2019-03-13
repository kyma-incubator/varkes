#!/usr/bin/env node
'use strict'

const odataApp = require("./app")
const app = require('express')()
import { logger as LOGGER } from "./logger"

var runAsync = async () => {
    var configPath: string = ""
    if (process.argv.length > 2) {

        var configPath = process.argv[2]
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
