'use strict';
var loopback = require('loopback');
var boot = require('loopback-boot');
const fs = require('fs');
var bodyParser = require('body-parser');
var LOGGER = require("./logger").logger
var parser = require("./parser")
const path = require("path")

var varkesConfig

module.exports = function (varkesConfigPath) {
  return configure(varkesConfigPath)
}

async function configure(varkesConfigPath) {
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
  app.varkesConfig = varkesConfig

  LOGGER.info("Parsing specifications and generating models")
  var parsedModels = [];
  for (var i = 0; i < varkesConfig.apis.length; i++) {
    parsedModels.push(parser.parseEdmx(varkesConfig.apis[i].specification_file));
  }
  parsedModels = await Promise.all(parsedModels)

  LOGGER.info("Booting loopback middleware")
  //for configuration, see https://apidocs.strongloop.com/loopback-boot/
  var bootConfig = JSON.parse(fs.readFileSync(__dirname + "/boot_config.json", "utf-8"))

  parsedModels.forEach(function (parsedModel) {

    parsedModel.modelConfigs.forEach(function (config) {
      bootConfig.models[config.name]=config.value
    })
    parsedModel.modelDefs.forEach(function (definition) {
      bootConfig.modelDefinitions.push(definition)
    })
  })

  if (varkesConfig.storage_file_path) {
    bootConfig.dataSources.db.file = varkesConfig.storage_file_path
  }

  return new Promise(function (resolve, reject) {
    boot(app, bootConfig, function (err) {
      if (err) {
        reject(err);
      }
      resolve(app);
    });
  });
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