#!/usr/bin/env node
'use strict'

import * as connectorApp from "./app"
import * as express from "express"
import { logger as LOGGER } from "./logger"
const app = express()
var configPath: string

var runAsync = async () => {

    if (process.argv.length > 2) {
        configPath = process.argv[2]
    }

    try {
        app.use(await connectorApp.init(configPath, __dirname))
        app.listen(10000, function () {
            LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()