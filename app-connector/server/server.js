var express = require("express")
var connector = require("./connector")
const bodyParser = require('body-parser');
var utility = require('./utility')

var app = express();
app.use(bodyParser.json());
var config = utility.readJsonFileSync("config.json")
app.post(config.startConnUrl, function (req, res) {

    if (!req.body) res.sendStatus(400);

    connector.exportKeys(req.body.url, config.keyDir);
    res.send(200);
});

app.get("/", function (req, res) {
    res.end("testing")
})
var server = app.listen(parseInt(config.port), function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});
