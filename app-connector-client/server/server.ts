#!/usr/bin/env node

import connectorApp from "./app"
import { LOGGER } from "./logger"

var app = require('express')()

var configPath: string = ""

if (process.argv.length > 2) {
    configPath = process.argv[2]
    if (process.argv.length > 3) {
        let nodePort = process.argv[3] //? this variable is not being used
    }
}

connectorApp(configPath).then(function (routes: any) {
    app.use(routes)
    app.listen(10000, function () {
        LOGGER.info("Started application on port %d", 10000)
    })
}).catch(function (error: any) {

    LOGGER.error("Problem while starting application: %s", error)
})



