var app = require("varkes-openapi-mock")("./config.js")
app = require("varkes-app-connector-client")("./config.js", app);

app.get('/entity/v1/courses', function (req, res, next) {

    var oldSend = res.send;
    res.send = function (data) {
        if (!(Object.keys(data).length === 0 && data.constructor === Object)) {
            data = JSON.parse(data);
            data.courses.push({ code: "C3", name: "course3" })
        }
        arguments[0] = JSON.stringify(data);
        oldSend.apply(res, arguments);
    }
    next();
});

app.start()