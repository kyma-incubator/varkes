module.exports = {
    registerCustomResponses: function (app) {
        app.post('/odata/authorizationserver/oauth/token', function (req, res, next) {

            console.log("entered oauth");
            console.log(req.body)
            res.send({ token: 4444 })
        });
    }
}