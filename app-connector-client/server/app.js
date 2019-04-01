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
const apis = require("./routes/apis")
const mockApis = require("./routes/localApis")
const connection = require("./connection")
const VARKES_LOGO = path.resolve(__dirname, 'views/static/logo.svg')
const cors = require("cors")
const LOGO_URL = "/logo";
const LOCAL_APIS_URL = "/local/apis";
const CONNECTION = "/connection";
const BATCH_REGISTERATION = "/local/apis/registeration";
function init(varkesConfigPath = null, currentPath = "", nodePortParam = null) {

    var varkesConfig = config(varkesConfigPath, currentPath)

    connection.init()

    var app = express()
    app.use(bodyParser.json())
    app.use(expressWinston.logger(LOGGER))

    app.use("/remote/apis", apis.router())
    app.use(LOCAL_APIS_URL, cors(), mockApis.router(varkesConfig))
    app.use(CONNECTION, connector.router(varkesConfig, nodePortParam))
    app.use("/events", events.router())

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/views/'))
    app.use(express.static(path.resolve(__dirname, 'views/static/')))
    app.get("/", function (req, res) {
        res.render('index', { appName: varkesConfig.name })
    })
    app.get("/info", function (req, res) {
        var info = {
            appName: varkesConfig.name,
            url: {
                logo: LOGO_URL,
                localApis: LOCAL_APIS_URL,
                connection: CONNECTION,
                registeration: {
                    batch: BATCH_REGISTERATION,
                    status: "/status"
                }
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