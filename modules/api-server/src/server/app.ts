#!/usr/bin/env node
'use strict'

import * as express from "express";
import * as fs from "fs";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as expressWinston from "express-winston";
import * as cors from "cors";
import * as connector from "./routes/connector";
import * as healthz from "./routes/healthz";
import * as events from "./routes/events";
import * as remoteApis from "./routes/remoteApis";
import * as localApis from "./routes/localApis";
import * as config from "@kyma-incubator/varkes-configuration"

const VARKES_LOGO = path.resolve(__dirname, 'resources/logo.svg')
const LOGO_URL = "/logo";
const LOCAL_APIS_URL = "/local";
const REMOTE_APIS_URL = "/remote/apis";
const EVENTS_URL = "/events";
const CONNECTION = "/connection";
const HEALTHZ = "/healthz";
const BATCH_REGISTRATION = "/local/registration";
const pathToSwaggerUI = require("swagger-ui-dist").absolutePath()
const LOGGER = config.logger("api-server")

async function init(config: config.Config) {
    let app = express()
    app.use(bodyParser.json())
    app.use(cors())
    app.options('*', cors())

    app.use(expressWinston.logger({
      winstonInstance: LOGGER,
      msg: "{{req.method}} {{req.url}}, status: {{res.statusCode}}{{process.env.DEBUG && process.env.NODE_ENV!='production' ?', headers: '+JSON.stringify(req.headers):''}}",
      expressFormat: false
    }))
    app.use(REMOTE_APIS_URL, remoteApis.router())
    app.use(LOCAL_APIS_URL, localApis.router(config))
    app.use(CONNECTION, connector.router())
    app.use(EVENTS_URL, events.router())
    app.use(HEALTHZ, healthz.router())

    app.use("/swagger-ui", express.static(pathToSwaggerUI))

    app.get("/info", function (req, res) {
        let info = {
            appName: config.name,
            links: {
                logo: LOGO_URL,
                localApis: LOCAL_APIS_URL + "/apis",
                remoteApis: REMOTE_APIS_URL,
                connection: CONNECTION,
                registration: BATCH_REGISTRATION,
                events: EVENTS_URL
            }
        }
        res.status(200).send(info);
    });
    app.get(LOGO_URL, function (req, res) {
        let img = fs.readFileSync(config.logo || VARKES_LOGO)
        res.writeHead(200, { 'Content-Type': "image/svg+xml" })
        res.end(img, 'binary')
    })
    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })
    
    return app;
}

export { init }