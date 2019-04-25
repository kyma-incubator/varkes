#!/usr/bin/env node
'use strict'

import { init } from "./app"
import * as express from 'express';
const app = express();
var runAsync = async () => {

    try {
        app.use(await init('http://localhost:10000'));
        app.listen(3000, function () {
            console.log("Started application on port " + 3000);
        })
    }
    catch (err) {
        console.log("Error while starting the application: " + err.message);
    }
}

runAsync();
