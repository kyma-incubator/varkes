var app = require("varkes-odata-mock")("../config.js")

app.post('/odata/authorizationserver/oauth/token', function (req, res, next) {

    console.log("entered oauth");
    console.log(req.body)
    res.send({ token: 4444 })
});
app.get("/odata/Courses(*)", function (req, res, next) {
    res.send("whaaaat")
})
function modifyResponseBody(req, res, next) {
    var oldSend = res.send;

    res.send = function (data) {
        // arguments[0] (or `data`) contains the response body
        if (arguments[0].statusCode == 401) {
            arguments[0] = "401 {Entity does not exist}";
        }
        else if (arguments[0].statusCode == 404) {
            arguments[0] = "404 Bad URL";
        }
        oldSend.apply(res, arguments);
    }
    next();
}

app.use(modifyResponseBody);