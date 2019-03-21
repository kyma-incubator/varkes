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
const connection = require("./connection")

const VARKES_LOGO = path.resolve(__dirname, 'views/static/logo.svg')

function init(varkesConfigPath = null, currentPath = "", nodePortParam = null) {

    var varkesConfig = config(varkesConfigPath, currentPath)
    connection.init()
    
    var app = express()
    app.use(bodyParser.json())
    app.use(expressWinston.logger(LOGGER))

    app.use("/apis", apis.router())
    app.use("/connection", connector.router(varkesConfig, nodePortParam))
    app.use("/events", events.router())

    app.set('view engine', 'ejs')
    app.set('views', path.join(__dirname, '/views/'))
    app.use(express.static(path.resolve(__dirname, 'views/static/')))
    app.get("/", function (req, res) {
        res.render('index', { appName: varkesConfig.name })
    })
    app.get("/logo", function (req, res) {
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