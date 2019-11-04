#!/usr/bin/env node
'use strict'

import * as bodyParser from "body-parser"
import { mock } from "./mock"
import * as express from "express"
import * as config from "@varkes/configuration"
import * as morgan from "morgan"
import * as fs from "fs"

const LOGGER = config.logger("openapi-mock")
const pathToSwaggerUI = require("swagger-ui-dist").absolutePath()

async function init(config: config.Config) {
  let app = express()

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))

  registerLogger(app);

  app.use(await mock(config))
  app.use("/swagger-ui", express.static(pathToSwaggerUI))

  customErrorResponses(app)
  return app;
}

function registerLogger(app: express.Application) {
  morgan.token('header', (req: any) => {
    if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
      return req.rawHeaders;
    else
      return "-";
  });
  morgan.token('body', function (req) {
    if (req.body && Object.keys(req.body).length != 0)
      return JSON.stringify(req.body);
    else
      return "-";
  });
  let logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
  let requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
  app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))
  app.get('/requests', function (req, res, done) {
    let text = fs.readFileSync("requests.log", "utf8");
    res.status(200);
    res.send(text);
  });
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