#!/usr/bin/env node
'use strict'

const config = require('./config.js')
const express = require("express")
const fs = require("fs")
const LOGGER = require("./logger").logger
const path = require("path")
const bodyParser = require('body-parser');
const CONFIG = require("./config.json")
const expressWinston = require('express-winston');
const connector = require("./routes/connector");
const events = require("./routes/events")
const apis = require("./routes/apis")
const keys = require("./keys")

module.exports = function (varkesConfigPath = null, nodePortParam = null) {
    var app = express()
    app.use(bodyParser.json());
    var varkesConfig = config(varkesConfigPath)

    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
    } else {
        keys.generatePrivateKey()
    }

    app.use(expressWinston.logger(LOGGER))

    app.use("/apis", apis.router())
    app.use("/connection", connector.router(varkesConfig, nodePortParam))
    app.use("/events", events.router())

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/views/'));
    app.use(express.static(path.resolve(__dirname, 'views/static/')))
    app.get("/", function (req, res) {
        res.render('index', { appName: varkesConfig.name })
    })

    app.get("/metadata", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/api.yaml"))
    })
    app.get("/console", function (req, res) {
        res.sendFile(path.resolve(__dirname, "resources/console.html"))
    })

    return new Promise(function (resolve, reject) {
        resolve(app)
    });
}

