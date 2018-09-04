var bodyParser = require('body-parser');
module.exports = function (app) {
    // Install a "/ping" route that returns "pong"
    app.get('/odata/authorizationserver/oauth/*', function (req, res, next) {
        if (req.query.response_type && req.query.scope) {
            if (req.query.redirect_uri) {
                res.status(200)
                res.send(req.query.redirect_uri + "#token=7777");
            }
            else
                res.send('Please, enter redirected_uri');
        }
        else {
            res.status(404)
            res.send('Wrong parameters');
        }

    });
    function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {
            // arguments[0] (or `data`) contains the response body
            if (arguments[0].statusCode == 401) {
                arguments[0] = "401 Entity does not exist";
            }
            else if (arguments[0].statusCode == 404) {
                arguments[0] = "404 Bad URL";
            }
            oldSend.apply(res, arguments);
        }
        next();
    }

    app.use(modifyResponseBody);
    app.use(bodyParser.json());


}