var path = "C:\\Users\\D074188\\Desktop\\varkes\\examples\\combined-odata-mock\\config.js"
var Resource = require('express-resource')
var app = require("varkes-odata-mock")(path, 8000)
app.middleware('routes:before', Resource);
app = require("varkes-app-connector-client")(app, path, true);
// if (app) {

//     app.listen(8000, function () {
//         app.startLoopback();
//     });
// }