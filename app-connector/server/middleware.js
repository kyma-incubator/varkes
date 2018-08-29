var CONFIG = require("../config")
var LOGGER = require("./logger")
var expressWinston = require('express-winston');

exports.defineMW = function (app) {

    app.use("/services", (req, res, next) => {
        if ((CONFIG.URLs.metadataUrl == "")) {
            res.statusCode = 404
            res.send({ error: "No URL defined, did you provide the token URL ?" })
        } else {

            next()
        }

    })

    app.use(expressWinston.logger(
        LOGGER.logger
    ))
}