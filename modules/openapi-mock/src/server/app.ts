#!/usr/bin/env node
'use strict'

import * as bodyParser from "body-parser"
import { mock } from "./mock"
import * as express from "express"
import * as config from "@kyma-incubator/varkes-configuration"
import * as fs from "fs"

const LOGGER = config.logger("openapi-mock")
const pathToSwaggerUI = require("swagger-ui-dist").absolutePath()

async function init(config: config.Config) {
  let app = express()

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use(await mock(config))
  app.use("/swagger-ui", express.static(pathToSwaggerUI))

  customErrorResponses(app)
  return app;
}

function customErrorResponses(app: express.Application) {
  app.use((err: any, req: any, res: any, next: any) => {
    if (!err.status) {
      err.status = 500;
    }
    LOGGER.debug("Converting error response to JSON having message: %s", err.message)
    res.status(err.status);
    res.type('json');
    res.send({ error: err.message })
  });
}

export { init }