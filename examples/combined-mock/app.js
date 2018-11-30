var path = "C:\\Users\\D074188\\Desktop\\varkes\\examples\\basic-re\\config.js"
var app = require("varkes-app-connector-client")(path);
app = require("varkes-openapi-mock")(app, path)
//app = require("varkes-odata-mock")("../../../odata-config.js")



app.get('/entity/v1/courses', function (req, res, next) {

    var oldSend = res.send;
    res.send = function (data) {
        console.log("*****data****")
        console.log(data);
        if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
            data = JSON.parse(data);
            data.courses.push({ code: "C3", name: "course3" })
        }
        arguments[0] = JSON.stringify(data);
        oldSend.apply(res, arguments);
    }
    next();
});
app.listen(2000, function () {
    console.log('Basic re is now running on http://localhost: 10000');
});
// app.post('/odata/authorizationserver/oauth/token', function (req, res, next) {

//     console.log("entered oauth");
//     console.log(req.body)
//     res.send({ token: 4444 })
// });
