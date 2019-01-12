var path = "C:\\Users\\D074188\\Desktop\\varkes\\examples\\combined-openapi-mock\\config.js"
var app = require("varkes-openapi-mock")(path)
app = require("varkes-app-connector-client")(path, app);
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
    console.log('OpenAPI Mock example is now running on http://localhost: 10000');
});
