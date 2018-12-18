'use strict';
var middlewares = [];
var memoryStores = [];
var middleware = require('swagger-express-middleware');
var MemoryDataStore = middleware.MemoryDataStore;
var path = require('path');
const bodyParser = require('body-parser');
var mock_controller = require("./api/mocks/mock_controller");
//pass the express app to the mock controller
var Resource = require("express-resource")
var app = require("express")();
module.exports = function (configPath) {
  var config = require(configPath);
  mock_controller.init(app, config);
  app.config = config;
  app.use(bodyParser.json());
  //register the function that records the requests to our application to the express app
  mock_controller.recordRequest(app);

  let server;
  app.start = function () {
    server = app.listen(config.port | 4000, function () {
      console.log('OpenAPI Mock is now running on http://localhost:' + config.port | 4000);
    });
  }
  // app.stop = function () {
  //   server.close();
  // }
  let myDB = new MemoryDataStore();

  app.parseSpecFile = function () {
    for (var i = 0; i < config.apis.length; i++) {
      middlewares.push(require('swagger-express-middleware'));
      //memoryStores.push(middlewares[i].MemoryDataStore);

      middlewares[i](config.apis[i].specification_file, app, function (err, middleware) {
        app.use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.files(),
          middleware.parseRequest(),
          middleware.validateRequest(),
        );
        //this function is responsible for resgistering any user defined responses to our specification
        app.use(middleware.mock(myDB));

        // creates user defined responses for certain error codes
        mock_controller.customErrorResponses(app);
      });
    }
  }
  app.parseSpecFile();
  //app.start();
  return app;
}

if (process.argv.length > 2) {

  app = module.exports(process.argv[2]);
  app.start();
}
