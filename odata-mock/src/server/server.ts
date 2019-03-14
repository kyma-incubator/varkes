#!/usr/bin/env node
'use strict'

import { init } from "./app"
const app = require('express')()
import { logger as LOGGER } from "./logger"

var runAsync = async () => {
    var configPath: string = ""
    if (process.argv.length > 2) {

        configPath = process.argv[2]
    }
    try {
        app.use(await init(configPath, __dirname))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()
