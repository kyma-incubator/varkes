var path = "C:\\Users\\D074188\\Desktop\\varkes\\examples\\combined-odata-mock\\config.js"
var Resource = require('express-resource')
require("varkes-odata-mock")(path).then(function (app) {
    app = require("varkes-app-connector-client")(path, app, true);
    app.listen(10000, function () {
        app.startLoopback()
    });
});

