module.exports = {
    remoting: {
        errorHandler: {
            handler: function (err, req, res, next) {
                // custom error handling logic
                console.log("error status")
                console.log(err.status)
                if (!err.status) {
                    res.status(500);
                    res.type('json');
                    var util = require("util");
                    res.send(util.format('{error:\"Something went Wrong\"}'));
                }
                else if (err.status == 404) {
                    res.status(err.status);
                    res.type('json');
                    var util = require('util');
                    res.send(util.format('{error:\"This is not a valid endpoint\"}', err.status, err.message));
                }
            }
        }
    }
};