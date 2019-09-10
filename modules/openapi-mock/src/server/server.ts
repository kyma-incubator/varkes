#!/usr/bin/env node
'use strict'

import * as openapiApp from "./app"
import * as express from "express"
const app = express()
var configPath: string

var runAsync = async () => {

    if (process.argv.length > 2) {
        configPath = process.argv[2]
    }

    try {
        app.use(await openapiApp.init(configPath, __dirname))
        app.listen(10000, function () {
            openapiApp.LOGGER.info("Started application on port %d", 10000)
        });
    } catch (error) {
        openapiApp.LOGGER.error("Problem while starting application: %s", error)
    }
}

runAsync()