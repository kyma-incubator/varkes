var bodyParser = require('body-parser');
var utility = require('../../common/utility/utility')

module.exports = function (app) {
    var customResponses = require(app.config.customResponses);
    customResponses.registerCustomResponses(app);
    utility.registerLogger(app);

    app.use(bodyParser.json());


}