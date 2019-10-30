#!/usr/bin/env node
'use strict'

import { init } from "./app"
const app = require('express')()

var runAsync = async () => {
    let configPath: string = ""
    if (process.argv.length > 2) {

        configPath = process.argv[2]
    }
    try {
        app.use(await init(configPath, __dirname))
        app.listen(10000, function () {
            console.info("Started application on port %d", 10000)
        });
    } catch (error) {
        console.error("Problem while starting application: %s", JSON.stringify(error))
    }
}

runAsync()
