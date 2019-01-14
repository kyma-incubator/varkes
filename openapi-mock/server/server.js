#!/usr/bin/env node

var app = require("./app")
var configPath //= "test/config.js"

if (process.argv.length > 2) {
    configPath = process.argv[2]
}

app = app(configPath)
app.start()
