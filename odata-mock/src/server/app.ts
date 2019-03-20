#!/usr/bin/env node
'use strict'
import { config } from "./config"
const loopback = require('loopback');
const boot = require('loopback-boot');
const fs = require('fs');
const path = require("path")
const bodyParser = require('body-parser');
import { logger as LOGGER } from "./logger"
import * as parser from "./parser"
import { VarkesConfigType } from "./types"


async function init(varkesConfigPath: string, currentPath = "") {
  var varkesConfig = config(varkesConfigPath, currentPath)
  var app = loopback();
  app.use(bodyParser.json());
  app.varkesConfig = varkesConfig

  LOGGER.info("Parsing specifications and generating models")
  //get the absolute path of varkesconfig after resolving so that subfiles can be referenced from varkesConfig.
  var bootConfig = await generateBootConfig(varkesConfig, path.dirname(path.resolve(currentPath, varkesConfigPath)))

  LOGGER.info("Booting loopback middleware")

  return new Promise(function (resolve, reject) {
    boot(app, bootConfig, function (err: Error) {
      if (err) {
        reject(err);
      }
      resolve(app);
    });
  });
}

async function generateBootConfig(varkesConfig: VarkesConfigType, currentPath: string) {
  var parsedModels: any[] = [];
  for (var i = 0; i < varkesConfig.apis.length; i++) {
    if (varkesConfig.apis[i].type == "odata") {
      parsedModels.push(parser.parseEdmx(path.resolve(currentPath, varkesConfig.apis[i].specification)));
    }
  }
  parsedModels = await Promise.all(parsedModels)

  //for configuration, see https://apidocs.strongloop.com/loopback-boot/
  var bootConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/boot_config.json", "utf-8"))

  parsedModels.forEach(function (parsedModel) {

    parsedModel.modelConfigs.forEach(function (config: any) {
      bootConfig.models[config.name] = config.value
    })
    parsedModel.modelDefs.forEach(function (definition: any) {
      bootConfig.modelDefinitions.push(definition)
    })
  })

  return bootConfig
}

export { init }