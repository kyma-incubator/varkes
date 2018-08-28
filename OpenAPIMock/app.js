'use strict';


process.env.DEBUG = 'swagger:middleware';

var express = require('express');
var middleware = require('swagger-express-middleware');
var path = require('path');
var util = require('util')
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

//middleware(path.join(__dirname, '../tests/files/petstore.yaml'), app, function(err, middleware) {
middleware(path.join(__dirname, 'api/swagger/swagger.yaml'), app, function (err, middleware) {
  // Add all the Swagger Express Middleware, or just the ones you need.
  // NOTE: Some of these accept optional options (omitted here for brevity)
  app.use(
    middleware.metadata(),
    middleware.CORS(),
    middleware.files(),
    middleware.parseRequest(),
    middleware.validateRequest(),
  );
  app.post('/:baseSiteId/cms/components', function (req, res, next) {

    console.log("entered post");
    res.body = {
      "idList": [
        "4",
        "5"
      ]
    }
    next();
  });

  app.use(middleware.mock())

  app.use(function (err, req, res, next) {
    console.log("error status")
    console.log(err.status)
    res.status(err.status);
    res.type('json');
    res.send(util.format('{error:\"Errorrrr\"}', err.status, err.message));
  });

  app.listen(10000, function () {
    console.log('OpenAPI Mock is now running at http://localhost:10000');
  });
});