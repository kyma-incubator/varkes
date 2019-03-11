#!/usr/bin/env node
'use strict'

const config = require('./config.js')
const loopback = require('loopback');
const boot = require('loopback-boot');
const fs = require('fs');
const bodyParser = require('body-parser');
const LOGGER = require("./logger").logger
const parser = require("./parser")

module.exports = async function (varkesConfigPath) {
  var varkesConfig = config(varkesConfigPath)

  var app = loopback();
  app.use(bodyParser.json());
  app.varkesConfig = varkesConfig

  LOGGER.info("Parsing specifications and generating models")
  var bootConfig = await generateBootConfig(varkesConfig)

  LOGGER.info("Booting loopback middleware")

  return new Promise(function (resolve, reject) {
    boot(app, bootConfig, function (err) {
      if (err) {
        reject(err);
      }
      resolve(app);
    });
  });
}

async function generateBootConfig(varkesConfig) {
  var parsedModels = [];
  for (var i = 0; i < varkesConfig.apis.length; i++) {
    if (varkesConfig.apis[i].type == "odata") {
      parsedModels.push(parser.parseEdmx(varkesConfig.apis[i].specification));
    }
  }
  parsedModels = await Promise.all(parsedModels)

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

  return bootConfig
}