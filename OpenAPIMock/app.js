'use strict';


process.env.DEBUG = 'swagger:middleware';

var yaml = require('js-yaml');
var fs = require('fs');
var express = require('express');
var middleware = require('swagger-express-middleware');
var path = require('path');
var util = require('util')
const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var doc;

app.use(function (req, res, next) {
  console.log("logging");
  var requestslog = "URL:\n" + req.url + "\n" + "HEADER: \n";
  requestslog += req.rawHeaders;
  if (Object.keys(req.body).length != 0) {
    console.log("body")
    requestslog += "\nBODY: \n" + JSON.stringify(req.body);
  }
  requestslog += "============================================\n";
  if (fs.existsSync("requests.log")) {

    fs.appendFile('requests.log', requestslog + "\n", function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  }
  else {
    fs.writeFile('requests.log', requestslog + "\n", function (err) {
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  }
  next();
});

try {
  doc = yaml.safeLoad(fs.readFileSync('api/swagger/swagger.yaml', 'utf8'));
} catch (e) {
  console.log(e);
}
app.get('/metadata', function (req, res) {
  res.type('text/x-yaml')
  res.status(200)
  res.send(doc)
});
middleware(path.join(__dirname, 'api/swagger/swagger.yaml'), app, function (err, middleware) {

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

  // app.use(function (err, req, res, next) {
  //   console.log("error status")
  //   console.log(err.status)
  //   res.status(err.status);
  //   res.type('json');
  //   res.send(util.format('{error:\"Errorrrr\"}', err.status, err.message));
  // });


  app.listen(10000, function () {
    console.log('OpenAPI Mock is now running at http://localhost:10000');
  });
});