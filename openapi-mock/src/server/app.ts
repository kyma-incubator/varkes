#!/usr/bin/env node
'use strict'

import * as bodyParser from "body-parser"
import { mock } from "./mock"
import * as express from "express"
import { configure } from "./config"
async function init(varkesConfigPath: string, currentDirectory = "") {
  var app = express()

  var varkesConfig = configure(varkesConfigPath, currentDirectory);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(await mock(varkesConfig))
  return app;
}

export { init }