var bodyParser = require('body-parser');
var utility = require('../../common/utility/utility')
module.exports = function (app) {
    app.use(function (req, res, next) {
        console.log("logging");
        var requestslog = "URL:\n" + req.url + "\n" + utility.getCurrentDateTime() + "\nHEADER: \n";
        requestslog += req.rawHeaders;
        if (Object.keys(req.body).length != 0) {
            console.log("body")
            requestslog += "\nBODY: \n" + JSON.stringify(req.body);
        }
        requestslog += "\n============================================\n";
        utility.writeToFile('requests.log', requestslog);
        next();
    });
    app.get('/authorizationserver/oauth/*', function (req, res, next) {
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