'use strict';
var loopback = require('loopback');
var boot = require('loopback-boot');
const fs = require('fs');
var bodyParser = require('body-parser');
var LOGGER = require("./logger").logger
var parser = require("./parser")
const path = require("path")

var varkesConfig

module.exports = async function (varkesConfigPath) {
  try {
    return await configure(varkesConfigPath)
  } catch (error) {
    LOGGER.error("Error while configuring the mock: %s", error)
    return null
  }
}

function configure(varkesConfigPath) {
  if (varkesConfigPath) {
    var endpointConfig = path.resolve(varkesConfigPath)
    LOGGER.info("Using configuration %s", endpointConfig)
    varkesConfig = require(endpointConfig)
    configValidation(varkesConfig)
  } else {
    LOGGER.info("Using default configuration")
    varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/defaultConfig.json", "utf-8"))
  }

  var app = loopback();
  app.use(bodyParser.json());
  parser.init()
  app.varkesConfig = varkesConfig

  app.start = function () {
    app.listen(CONFIG.port, function () {
      LOGGER.info("%s listening at port %d", CONFIG.name, CONFIG.port)
    });
    if (app.get('loopback-component-explorer')) {
      var baseUrl = app.get('url').replace(/\/$/, '');
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      LOGGER.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  }

  var resource = JSON.parse(fs.readFileSync(__dirname + "/resources/datasources.json", "utf-8"))
  if (varkesConfig.storage_file_path) {
    resource.db.file = varkesConfig.storage_file_path
  }
  fs.writeFileSync(__dirname + "/../generated/datasources.json", JSON.stringify(resource));

  resource = JSON.parse(fs.readFileSync(__dirname + "/resources/config.json", "utf-8"))
  fs.writeFileSync(__dirname + "/../generated/config.json", JSON.stringify(resource));

  resource = JSON.parse(fs.readFileSync(__dirname + "/resources/middleware.json", "utf-8"))
  fs.writeFileSync(__dirname + "/../generated/middleware.json", JSON.stringify(resource));

  resource = JSON.parse(fs.readFileSync(__dirname + "/resources/component-config.json", "utf-8"))
  fs.writeFileSync(__dirname + "/../generated/component-config.json.json", JSON.stringify(resource));

  var filePaths = [];
  for (var i = 0; i < varkesConfig.apis.length; i++) {
    filePaths.push(parser.parseEdmx(varkesConfig.apis[i].specification_file));
  }
  LOGGER.info("Initializing APIs")
  return new Promise(function (resolve, reject) {
    Promise.all(filePaths).then(function (result) {
      boot(app, __dirname, function (err) {
        if (err) reject(err);
        resolve(app);
      });
    });
  }).catch((error) => {
    LOGGER.error("Error while initializing APIs: %s", error)
  })
}

function configValidation(configJson) {
  var error_message = "";
  if (configJson.hasOwnProperty("apis")) {
    var apis = configJson.apis;
    var matchRegex = /^(\/[a-zA-Z0-9]+)+$/
    for (var i = 1; i <= apis.length; i++) {
      var api = apis[i - 1];
      if (!api.name || !api.name.match(/[a-zA-Z0-9]+/)) {
        error_message += "\napi number " + i + ": name does not exist or is in the wrong format";
      }
      if (!api.metadata || !api.metadata.match(matchRegex)) {
        error_message += "\napi " + api.name + ": metadata does not exist or is in the wrong format";
      }
      if ((!api.specification_file || !api.specification_file.match(/[a-zA-Z0-9]+.xml/))) {
        error_message += "\napi " + api.name + ": specification_file does not exist or is not a xml file";
      }
    }
  }

  if (error_message != "") {
    throw new Error("Config Error: " + error_message);
  }
}