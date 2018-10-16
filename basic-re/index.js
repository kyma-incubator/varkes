const express = require('express')
const app = express()

app.get("/", (req, res) => {
    console.log(req)
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({ "response": "It's alive !" }))
})
app.get('/myapi', (req, res) => {
    console.log(req)
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({ "response": "You reached it :)" }))


})

app.get('/metadata', (req, res) => {
    console.log(req)
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({ "metadata": "some metadata" }))
})

app.post("/oauth/token", (req, res) => {
    console.log(req)
    res.setHeader("Content-Type", "application/json")
    res.send(JSON.stringify({ "token": 3333 }))
})
var server = app.listen(4000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Basic remote env listening at http://%s:%s", host, port)

});
module.exports = server
