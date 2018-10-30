'use strict';

var middleware = require('swagger-express-middleware');
const MemoryDataStore = middleware.MemoryDataStore;
var path = require('path');
const bodyParser = require('body-parser');
var mock_controller = require("./api/mocks/mock_controller");
//pass the express app to the mock controller
var app = mock_controller.init();
mock_controller.createEndpoints();
app.use(bodyParser.json());
//register the function that records the requests to our application to the express app
mock_controller.recordRequest(app);

mock_controller.createMetadataEndpoint();


module.exports = function (configPath) {
  return {
    app,
    init: function () {
      var config = require(configPath);
      let server;
      app.start = function () {
        server = app.listen(config.port, function () {
          console.log('OpenAPI Mock is now running at http://localhost' + config.port);
        });
      }
      app.stop = function () {
        server.close();
      }
      app.parseSpecFile = function () {
        middleware(config.specification_file, app, function (err, middleware) {
          let myDB = new MemoryDataStore();
          app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest(),
            middleware.validateRequest(),
          );
          //this function is responsible for resgistering any user defined responses to our specification
          if (config.hasOwnProperty("customResponsePath"))
            mock_controller.registerCustomResponses(app);
          app.use(middleware.mock(myDB));

          // creates user defined responses for certain error codes
          mock_controller.customErrorResponses(app);
        });
      }
      app.parseSpecFile();
      app.start();
    }
  };
}