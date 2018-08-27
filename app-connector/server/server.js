var express = require("express")
var connector = require("./connector")
const bodyParser = require('body-parser');

var app =  express();
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json());

app.post('/startConnection/', function (req, res) {

     if(!req.body)res.sendStatus(400);

     connector.exportKeys(req.body.url);
     res.send(200);
});

app.get("/", function (req, res) {
    res.end("testing")
})
var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

});
