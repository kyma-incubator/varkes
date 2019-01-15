'use strict';
var loopback = require('loopback');
var utility = require("./utility");
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var LOGGER = require("./logger").logger
var parser = require("./parser")
const path = require("path")

var varkesConfig

module.exports = async function (varkesConfigPath) {
  app = await configure(varkesConfigPath).catch((error) => {
    LOGGER.error("%s", error)
  })
  return app
}

function configure(varkesConfigPath) {
  if (varkesConfigPath) {
    var endpointConfig = path.resolve(varkesConfigPath)
    LOGGER.info("Using configuration %s", endpointConfig)
    varkesConfig = require(endpointConfig)
    configValidation(varkesConfig)
  } else {
    LOGGER.info("Using default configuration")
    varkesConfig = JSON.parse(fs.readFileSync("resources/defaultConfig.json", "utf-8"))
  }

  var app = loopback();
  app.use(bodyParser.json());


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

  var resource = JSON.parse(fs.readFileSync("resources/datasources.json", "utf-8"))
  if (varkesConfig.storage_file_path) {
    resource.db.file = varkesConfig.storage_file_path
  }
  fs.writeFileSync("../generated/datasources.json", JSON.stringify(resource));

  resource= JSON.parse(fs.readFileSync("resources/config.json", "utf-8"))
  fs.writeFileSync("../generated/config.json", JSON.stringify(resource));

  resource = JSON.parse(fs.readFileSync("resources/middleware.json", "utf-8"))
  fs.writeFileSync("../generated/middleware.json", JSON.stringify(resource));

  resource = JSON.parse(fs.readFileSync("resources/component-config.json.json", "utf-8"))
  fs.writeFileSync("../generated/component-config.json.json", JSON.stringify(resource));

  var filePaths = [];
  for (var i = 0; i < varkesConfig.apis.length; i++) {
    filePaths.push(parser.parseEdmx(varkesConfig.apis[i].specification_file));
  }
  LOGGER.info("Initializing apis")
  return new Promise(function (resolve, reject) {

    Promise.all(filePaths).then(function (result) {
      boot(app, __dirname, function (err) {
        if (err) reject(err);
        resolve(app);
      });
    }).catch((error) => {
      reject(error)
    });
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