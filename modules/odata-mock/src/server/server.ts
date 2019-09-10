#!/usr/bin/env node
'use strict'

import { init, LOGGER } from "./app"
const app = require('express')()

var runAsync = async () => {
    let configPath: string = ""
    if (process.argv.length > 2) {

        configPath = process.argv[2]
    }
    try {
        app.use(await init(configPath, __dirname))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

runAsync()
