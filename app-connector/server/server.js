var express = require("express")
var connector = require("./connector")
const bodyParser = require('body-parser');
const CONFIG = require("../config")
var app = express();
app.use(bodyParser.json());

app.post("/startConn", function (req, res) {

    if (!req.body) res.sendStatus(400);

    connector.exportKeys(req.body.url, (data) => {

        res.send(data)
    })
});

app.get("/", function (req, res) {
    res.sendfile("server/views/index.html")
})

var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});
