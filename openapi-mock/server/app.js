'use strict';

var middleware = require('swagger-express-middleware');
const LOGGER = require("./logger").logger
const bodyParser = require('body-parser');
var mock_controller = require("./mock_controller");
var Resource = require("express-resource")
var app = require("express")();
const path = require("path")
const fs = require('fs');

var middlewares = [];
var memoryStores = [];
var MemoryDataStore = middleware.MemoryDataStore;
var varkesConfig

module.exports = function (varkesConfigPath) {
  if (varkesConfigPath) {
    var endpointConfig = path.resolve(varkesConfigPath)
    LOGGER.info("Using configuration %s", endpointConfig)
    varkesConfig = require(endpointConfig)
    configValidation(varkesConfig)
  } else {
    LOGGER.info("Using default configuration")
    varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/defaultConfig.json", "utf-8"))
  }

  app.config = varkesConfig;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  mock_controller.init(app, varkesConfig);
  mock_controller.recordRequest(app);

  let myDB = new MemoryDataStore();

  for (var i = 0; i < varkesConfig.apis.length; i++) {
    middlewares.push(
      middleware(varkesConfig.apis[i].specification, app, function (err, middleware) {
        app.use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.files(),
          middleware.parseRequest(),
          middleware.validateRequest(),
          middleware.mock(myDB),
        );
        mock_controller.customErrorResponses(app)
      })
    );
  }
  return new Promise(function (resolve, reject) {
    resolve(app)
  });
}

function configValidation(configJson) {
  var error_message = "";
  if (configJson.hasOwnProperty("apis")) {
    for (var i = 1; i <= configJson.apis.length; i++) {
      var api = configJson.apis[i - 1];
      if (!api.name) {
        error_message += "\napi number " + i + ": missing attribute 'name', a name is mandatory";
      }
      if(!api.type){
        api.type="openapi"
      }
      if (!api.type.match(/^(openapi|odata)$/)) {
        error_message += "\napi " + api.name + ": type " + api.type + " is not matching the pattern '^(openapi|odata)$'";
      }
      if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi " + api.name + ": metadata " + api.metadata + " is not matching the pattern '^\\/[/\\\\\w]+$+'";
      }
      if (api.oauth && !api.oauth.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi " + api.name + ": oauth " + api.oath + " is not matching the pattern '^\\/[/\\\\\w]+$'";
      }
      if (api.type == "openapi" && !api.specification.match(/^.+\.(json|yaml|yml)$/)) {
        error_message += "\napi " + api.name + ": specification " + api.specification + " does not match pattern '^.+\\.(json|yaml|yml)$'";
      }
      if (api.type == "openapi" && !api.baseurl) {
        error_message += "\napi " + api.name + ": missing attribute 'baseurl', a baseurl is mandatory";
      }
      if (api.type == "openapi" && !api.baseurl.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi " + api.name + ": baseurl " + api.baseurl + " is not matching the pattern '^\\/[/\\\\\w]+$'";
      }
    }
  }

  if (error_message != "") {
    throw new Error("Validation of configuration failed: " + error_message);
  }
}

