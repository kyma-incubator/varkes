var bodyParser = require('body-parser');
var utility = require('../../common/utility/utility')

module.exports = function (app) {
    utility.registerLogger(app);
    function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {
            console.log("status code")
            console.log(arguments[0])
            if (!arguments[0] && arguments[0].statusCode) {
                arguments[0] = {};
                arguments[0].statusCode = 500;
            }
            if (app.config.error_messages.hasOwnProperty(arguments[0].statusCode)) {
                arguments[0] = app.config.error_messages[arguments[0].statusCode];
            }
            else if (app.config.error_messages.hasOwnProperty(arguments[0])) {
                arguments[0] = app.config.error_messages[arguments[0]];
            }
            oldSend.apply(res, arguments);
        }
        next();
    }

    app.use(modifyResponseBody);
    app.use(bodyParser.json());


}