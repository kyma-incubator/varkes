#!/usr/bin/env node

var app = require("./app")
var nodePort
var odata
var configPath = "test/varkes_config.js"

if (process.argv.length > 2) {
    configPath = process.argv[2]
}

app = app(configPath)
app.start()
