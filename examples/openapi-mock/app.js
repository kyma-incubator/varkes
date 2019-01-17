var openapiApp = require("varkes-openapi-mock")

var app = require('express')()

runAsync = async () => {
    try {
        app.use(await openapiApp("./varkes_config.js"))
        return app.listen(10000, function () {
            console.info("Started application on port %d", 10000)
        });
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()