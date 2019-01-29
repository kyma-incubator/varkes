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
      bootConfig.models[config.name] = config.value
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
    for (var i = 1; i <= configJson.apis.length; i++) {
      var api = configJson.apis[i - 1];
      if (!api.name) {
        error_message += "\napi number " + i + ": missing attribute 'name', a name is mandatory";
      } if (!api.name.match(/^[\w]+$/)) {
        error_message += "\napi " + api.name + ": name '" + api.name + "' contains non-alphanumeric letters, please remove them";
      }
      if (api.type && !api.type.match(/^(openapi|odata)$/)) {
        error_message += "\napi " + api.name + ": type '" + api.type + "' is not matching the pattern '^(openapi|odata)$'";
      }
      if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi " + api.name + ": metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\w]+$'";
      }
      if (api.type == "odata" && !api.specification_file.match(/^[/\\\w]+.xml$/)) {
        error_message += "\napi " + api.name + ": specification_file '" + api.specification_file + "' does not match pattern '^[/\\\\w]+.xml$'";
      }
    }
  }

  if (error_message != "") {
    throw new Error("Validation of configuration failed: " + error_message);
  }
}