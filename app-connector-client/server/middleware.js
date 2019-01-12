var CONFIG = require("./config")
var LOGGER = require("./logger")
var expressWinston = require('express-winston');

exports.defineMW = function (app) {
    app.use(expressWinston.logger(
        LOGGER.logger
    ))
}