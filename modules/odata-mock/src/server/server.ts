#!/usr/bin/env node
'use strict'

import { init } from "./app"
import * as config from "@varkes/configuration"

const app = require('express')()

var runAsync = async () => {
    let configPath: string = ""
    if (process.argv.length > 2) {

        configPath = process.argv[2]
    }
    try {
        let configuration = await config.resolveFile(configPath, __dirname)
        app.use(await init(configuration))
        app.listen(10000, function () {
            console.info("Started application on port %d", 10000)
        });
    } catch (error) {
        console.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

runAsync()
