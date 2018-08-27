var express = require("express")
var connector = require("./connector")


var app = express()
var url
app.post('/startConnection/', function (req, res) {

    console.log(res.body);
});

app.get("/", function (req, res) {
    res.end("testing")
})
var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});