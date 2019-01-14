var app = require("varkes-openapi-mock")("./config.js")

app.get('/entity/courses', function (req, res, next) {

    var oldSend = res.send;
    res.send = function (data) {
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

app.start()