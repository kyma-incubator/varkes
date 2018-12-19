var path = "C:\\Users\\D074188\\Desktop\\varkes\\examples\\combined-odata-mock\\config.js"
var Resource = require('express-resource')
var app = require("varkes-odata-mock")(path)
app = require("varkes-app-connector-client")(app, path, true);
