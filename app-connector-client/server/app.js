#!/usr/bin/env node
'use strict'

const config = require('./config.js')
const express = require("express")
const fs = require("fs")
const LOGGER = require("./logger").logger
const path = require("path")
const bodyParser = require('body-parser')
const expressWinston = require('express-winston')
const connector = require("./routes/connector")
const events = require("./routes/events")
const remoteApis = require("./routes/remoteApis")
const localApis = require("./routes/localApis")
const connection = require("./connection")
const VARKES_LOGO = path.resolve(__dirname, 'views/static/logo.svg')
const cors = require("cors")
const LOGO_URL = "/logo";
const LOCAL_APIS_URL = "/local";
const REMOTE_APIS_URL = "/remote/apis";
const EVENTS_URL = "/events";
const CONNECTION = "/connection";
const BATCH_REGISTRATION = "/local/registration";
function init(varkesConfigPath = null, currentPath = "", nodePortParam = null) {

    var varkesConfig = config(varkesConfigPath, currentPath)

    connection.init()

    var app = express()
    app.use(bodyParser.json())
    app.use(cors())
    app.options('*', cors())
    app.use(expressWinston.logger(LOGGER))
    app.use(REMOTE_APIS_URL, remoteApis.router())
    app.use(LOCAL_APIS_URL, localApis.router(varkesConfig))
    app.use(CONNECTION, connector.router(varkesConfig, nodePortParam))
    app.use(EVENTS_URL, events.router())

    app.get("/info", function (req, res) {

        var info = {
            appName: varkesConfig.name,
            connected: connection.established(),
            insecure: connection.established() ? !connection.secure() : false,
            connection: connection.established() ? connection.info() : {},
            links: {
                logo: LOGO_URL,
                localApis: LOCAL_APIS_URL + "/apis",
                remoteApis: REMOTE_APIS_URL,
                connection: CONNECTION,
                registration: BATCH_REGISTRATION,
                events: EVENTS_URL,
                key: CONNECTION + "/key",
                cert: CONNECTION + "/cert"
            }
        }
        res.status(200).send(info);
    });
    app.get(LOGO_URL, function (req, res) {
        var img = fs.readFileSync(varkesConfig.logo || VARKES_LOGO)
        res.writeHead(200, { 'Content-Type': "image/svg+xml" })
        res.end(img, 'binary')
    })
    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })

    return new Promise(function (resolve, reject) {
        resolve(app)
    })
}

module.exports = {
    init: init
}