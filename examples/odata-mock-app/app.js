var app = require("varkes-odata-mock")("../config.js")

app.post('/odata/authorizationserver/oauth/token', function (req, res, next) {

    console.log("entered oauth");
    console.log(req.body)
    res.send({ token: 4444 })
});
app.get("/odata/Courses(*)", function (req, res, next) {
    res.send("whaaaat")
});