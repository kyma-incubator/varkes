var bodyParser = require('body-parser');
var morgan = require('morgan')
var fs = require('fs')
module.exports = function (app) {

    morgan.token('header', function (req, res) {
        if (Object.keys(req.rawHeaders).length != 0)
            return req.rawHeaders;
        else
            return "-";
    });
    morgan.token('body', function (req, res) {
        if (Object.keys(req.body).length != 0)
            return JSON.stringify(req.body);
        else
            return "-";
    });
    var logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
    var requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
    app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))

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