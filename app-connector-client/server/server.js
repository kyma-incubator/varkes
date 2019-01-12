#!/usr/bin/env node

var app = require("./app")
var nodePort
var odata
var configPath

if (process.argv.length > 2) {
    configPath = process.argv[2]
    if (process.argv.length > 3) {
        nodePort = process.argv[3]
    }
}

app = app(configPath, null , odata, nodePort)
app.start()
