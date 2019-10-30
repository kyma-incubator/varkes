#!/usr/bin/env node
'use strict'

import { init } from "./app"
import * as express from "express"
const app = express()
var configPath: string

var runAsync = async () => {

    if (process.argv.length > 2) {
        configPath = process.argv[2]
    }

    try {
        app.use(await init(configPath, __dirname))
        app.listen(10000, function () {
            console.log("Started application on port %d", 10000)
        });
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

runAsync()