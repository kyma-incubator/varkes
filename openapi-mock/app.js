'use strict';


//process.env.DEBUG = 'swagger:middleware';
var middleware = require('swagger-express-middleware');
var path = require('path');
const bodyParser = require('body-parser');
const config = require('./api/config')
var mock_controller = require("./api/mocks/mock_controller");
//pass the express app to the mock controller
var app = mock_controller.init();
mock_controller.createOAuth2Endpoint();
app.use(bodyParser.json());
//register the function that records the requests to our application to the express app
mock_controller.recordRequest();

mock_controller.createMetadataEndpoint();
let server;
app.start = function () {
  server = app.listen(10000, function () {
    console.log('OpenAPI Mock is now running at http://localhost:10000');
  });
}
app.stop = function () {
  server.close();
}
module.exports = app;
middleware(path.join(__dirname, config.specification_file), app, function (err, middleware) {

  app.use(
    middleware.metadata(),
    middleware.CORS(),
    middleware.files(),
    middleware.parseRequest(),
    middleware.validateRequest(),
  );
  //this function is responsible for resgistering any user defined responses to our specification
  mock_controller.registerCustomResponses(app);
  app.use(middleware.mock())

  // creates user defined responses for certain error codes
  mock_controller.customErrorResponses(app);
  app.start();
});

