#!/usr/bin/env node
'use strict'
import { config } from "./config"
const loopback = require('loopback');
const boot = require('loopback-boot');
const fs = require('fs');
const express = require('express')
const bodyParser = require('body-parser');
import { logger as LOGGER } from "./logger"
import * as parser from "./parser"
const explorer=require('loopback-component-explorer')

async function init(varkesConfigPath: string, currentPath = "") {
  var varkesConfig = config(varkesConfigPath, currentPath)
  var promises: Promise<any>[] = [];

  for (var i = 0; i < varkesConfig.apis.length; i++) {
    var api = varkesConfig.apis[i]
    promises.push(bla(api, varkesConfig))
  }

  let resultApp = express()
  let apps = await Promise.all(promises)
  for (var i = 0; i < apps.length; i++) {
    resultApp.use(apps[i])
  }
  
  return resultApp
}

async function bla(api: any, varkesConfig: any) {
  if (api.type == "odata") {
    var app = loopback();
    app.use(bodyParser.json());
    app.varkesConfig = varkesConfig

    LOGGER.info("Parsing specification and generating models for api %s", api.name)
    var bootConfig = await generateBootConfig(api)

    LOGGER.info("Booting loopback middleware for api %s", api.name)

    return new Promise(function (resolve, reject) {
      boot(app, bootConfig, function (err: Error) {
        if (err) {
          reject(err);
        }
        resolve(app);
      })
    })
  }
}

async function generateBootConfig(api: any) {
  var parsedModel = await parser.parseEdmx(api.specification)

  //for configuration, see https://apidocs.strongloop.com/loopback-boot/
  var bootConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/boot_config_template.json", "utf-8"))

  parsedModel.modelConfigs.forEach(function (config: any) {
    bootConfig.models[config.name] = config.value
  })
  parsedModel.modelDefs.forEach(function (definition: any) {
    bootConfig.modelDefinitions.push(definition)
  })

  let restBasePath = api.basepath.replace("/odata", "/api")
  bootConfig.components["n-odata-server"].path = api.basepath + "/*"
  bootConfig.components["loopback-component-explorer"].mountPath = restBasePath + "/console"
  bootConfig.components["loopback-component-explorer"].basePath = restBasePath
  bootConfig.middleware.routes["n-odata-server#odata"].paths.push(api.basepath + "/*")
  bootConfig.middleware.routes["loopback#rest"].paths.push(restBasePath)

  return bootConfig
}

export { init }