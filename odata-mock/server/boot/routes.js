var bodyParser = require('body-parser');
var morgan = require('morgan')
var LOGGER = require("./../logger").logger
const fs = require('fs');

module.exports = function (app) {
    registerLogger(app);
    var apis = app.varkesConfig.apis;
    apis.forEach(function (api) {
        app.get(api.metadata ? api.metadata : "/metadata", function (req, res, next) {
            var spec = fs.readFileSync(api.specification_file, 'utf-8');
            res.status(200);
            res.type("text/xml");
            res.send(spec);
        });
    });

    function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {
            if (!arguments[0] && arguments[0].statusCode) {
                arguments[0] = {};
                arguments[0].statusCode = 500;
            }
            if (app.varkesConfig.hasOwnProperty("error_messages")) {
                if (app.varkesConfig.error_messages.hasOwnProperty(arguments[0].statusCode)) {
                    LOGGER.debug("Modifying error response with status code '%s'", arguments[0].statusCode)
                    arguments[0] = app.varkesConfig.error_messages[arguments[0].statusCode];
                }
                else if (app.varkesConfig.error_messages.hasOwnProperty(arguments[0])) {
                    arguments[0] = app.varkesConfig.error_messages[arguments[0]];
                }
            }
            oldSend.apply(res, arguments);
        }
        next();
    }

    function registerLogger(app) {
        morgan.token('header', function (req, res) {
            if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
                return req.rawHeaders;
            else
                return "-";
        });
        morgan.token('body', function (req, res) {
            if (req.body && Object.keys(req.body).length != 0)
                return JSON.stringify(req.body);
            else
                return "-";
        });
        var logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
        var requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
        app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))
    }

    app.use(modifyResponseBody);
    app.use(bodyParser.json());
}