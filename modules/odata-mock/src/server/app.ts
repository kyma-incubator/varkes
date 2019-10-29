#!/usr/bin/env node
'use strict'

import * as parser from "./parser"
import * as config from "@varkes/configuration"

const loopback = require('loopback');
const boot = require('loopback-boot');
const fs = require('fs');
const express = require('express')
const bodyParser = require('body-parser');
const path = require("path")
const LOGGER: any = config.logger("odata-mock")

async function init(varkesConfigPath: string, currentPath = "") {
  let varkesConfig = config.load(varkesConfigPath, currentPath)

  let promises: Promise<any>[] = [];
  for (let i = 0; i < varkesConfig.apis.length; i++) {
    let api = varkesConfig.apis[i]
    if (api.type == "odata") {
      promises.push(bootLoopback(api, varkesConfig))
    }
  }

  let resultApp = express()
  let apps = await Promise.all(promises)
  for (let i = 0; i < apps.length; i++) {
    resultApp.use(apps[i])
  }

  return resultApp
}

async function bootLoopback(api: config.types.API, varkesConfig: config.types.Config) {
  let app = loopback();
  app.use(bodyParser.json());
  app.varkesConfig = varkesConfig

  LOGGER.debug("Parsing specification and generating models for api %s", api.name)
  let bootConfig = await generateBootConfig(api)

  LOGGER.debug("Booting loopback middleware for api %s", api.name)

  return new Promise(function (resolve, reject) {
    boot(app, bootConfig, function (err: Error) {
      if (err) {
        reject(err);
      }
      LOGGER.debug("Loopback middleware for api %s is booted", api.name)
      resolve(app);
    })
  })
}

async function generateBootConfig(api: config.types.API) {
  let dataSourceName = api.name.replace(/\s/g, '')
  let parsedModel = await parser.parseEdmx(api.specification, dataSourceName)

  //for configuration, see https://apidocs.strongloop.com/loopback-boot/
  let bootConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "resources/boot_config_template.json"), "utf-8"))

  parsedModel.modelConfigs.forEach(function (config: any) {
    bootConfig.models[config.name] = config.value
  })
  bootConfig.models["ACL"] = {
    dataSource: dataSourceName,
    public: false
  }
  parsedModel.modelDefs.forEach(function (definition: any) {
    bootConfig.modelDefinitions.push(definition)
  })

  bootConfig.appRootDir = __dirname
  bootConfig.appConfigRootDir = __dirname

  let restBasePath = api.basepath.replace("/odata", "/api")
  bootConfig.components["loopback-component-explorer"] = {
    mountPath: restBasePath + "/console",
    basePath: restBasePath
  }
  bootConfig.components["./odata-server"] = {
    path: api.basepath + "/*",
    odataversion: "2",
    useViaMiddleware: false
  }

  bootConfig.middleware.routes["n-odata-server#odata"].paths = [api.basepath + "/*"]
  bootConfig.middleware.routes["loopback#rest"].paths = [restBasePath]
  bootConfig.middleware["initial:before"]["loopback#favicon"].params = path.join(__dirname, "resources/favicon.ico")

  bootConfig.dataSources[dataSourceName] = {
    name: dataSourceName,
    connector: "memory"
  }

  if (api.persistence) {
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }
    bootConfig.dataSources[dataSourceName].file = "data/" + dataSourceName + ".json"
  }

  bootConfig.bootScripts = [path.resolve(__dirname, "routes.js")]
  return bootConfig
}

export { init }