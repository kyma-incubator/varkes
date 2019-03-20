#!/usr/bin/env node
'use strict'

const LOGGER = require("./logger").logger
const bodyParser = require('body-parser');
const mock = require("./mock");
const express = require("express");
const config = require('./config.js')
async function init(varkesConfigPath, currentDirectory = "") {
  var app = express()

  var varkesConfig = config(varkesConfigPath, currentDirectory);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(await mock(varkesConfig))
  return app;
}

module.exports = { init: init }