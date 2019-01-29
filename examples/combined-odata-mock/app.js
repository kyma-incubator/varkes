var odataApp = require("varkes-odata-mock")
var connectorApp = require("varkes-app-connector-client")

var app = require('express')()

runAsync = async () => {
    try {
        app.use(await odataApp("./varkes_config.json"))
        app.use(await connectorApp("./varkes_config.json"))
        return app.listen(10000, function () {
            console.info("Started application on port %d", 10000)
        });
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()