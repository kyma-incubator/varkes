#!/usr/bin/env node
'use strict'

import * as express from "express"
import * as yaml from "js-yaml"
import * as fs from "fs"
import * as config from "@varkes/configuration"
import { SwaggerMiddleware } from "swagger-express-middleware";
const pretty_yaml = require("json-to-pretty-yaml") //use require for libraries without type
const LOGGER = config.logger("openapi-mock")
const Converter = require("api-spec-converter")
const middleware = require("swagger-express-middleware")

const DIR_NAME = "./generated/";
const TMP_FILE = "tmp.yaml";

async function mock(config: config.Config) {
    let resultApp = express()
    let error_message = "";
    for (let i = 0; i < config.apis.length; i++) {
        let api = config.apis[i];
        if (!api.type || api.type == "openapi") {
            try {
                let app = express()
                createOauthEndpoint(api, app);
                createConsole(api, app);

                let spec: any = loadSpec(api)
                if (spec.openapi) {
                    let jsonSpec = await transformSpec(api)
                    let specString = jsonSpec.stringify({ syntax: "yaml" })
                    writeSpec(specString, api, i)
                    spec = loadSpec(api)
                }
                if (api.basepath) {
                    spec.basePath = api.basepath
                }
                await validateSpec(api, 'swagger_2')

                createMetadataEndpoint(spec, api, app);

                writeSpec(pretty_yaml.stringify(spec), api, i)

                let myDB = new middleware.MemoryDataStore();
                if (api.persistence) {
                    if (!fs.existsSync("./data")) {
                        fs.mkdirSync("./data");
                    }
                    myDB = new middleware.FileDataStore("./data");
                }

                let middlewares = [];
                middlewares.push(
                    middleware(api.specification, app, (_err: Error, middleware: SwaggerMiddleware) => {
                        app.use(
                            middleware.metadata(),
                            middleware.CORS(),
                            middleware.files(),
                            middleware.parseRequest(),
                            middleware.validateRequest(),
                            middleware.mock(myDB),
                        );
                    })
                )
                resultApp.use(app)
            }
            catch (err) {
                let message = "Serving API " + api.name + " failed: " + err.message
                LOGGER.error(message)
                error_message += "\n" + message
            }
        }
    }
    if (error_message != "") {
        throw new Error(error_message);
    }
    return resultApp
}

function loadSpec(api: config.API) {
    LOGGER.debug("Loading api '%s' from file '%s'", api.name, api.specification);
    return yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'));
}

function writeSpec(specString: string, api: config.API, index: number) {
    let file_name = DIR_NAME + index + "_" + TMP_FILE;
    LOGGER.debug("Writing api '%s' to file '%s' and length %d", api.name, file_name, specString.length);

    if (!fs.existsSync(DIR_NAME)) {
        fs.mkdirSync(DIR_NAME);
    }

    fs.writeFileSync(file_name, specString);

    api.specification = file_name;
}

function createOauthEndpoint(api: config.API, app: express.Application) {
    LOGGER.debug("Adding oauth endpoint '%s%s'", api.basepath, api.oauth)
    app.post(api.basepath + api.oauth, function (req, res) {
        if (req.body.client_id && req.body.client_secret && req.body.grant_type) {
            res.type('application/json');
            res.status(200);
            res.send({ token: 3333 });
        }
        else {
            let message = "Some of the required parameters are missing";
            res.status(400);
            res.send({ error: message });
        }
    });
}

async function validateSpec(api: config.API, type: string) {
    LOGGER.debug("Validating spec of api '%s'", api.name);
    return Converter.getSpec(api.specification, type)
        .then((fromSpec: any) => {
            return fromSpec.validate()
        }).then((result: any) => {
            if (result.errors) {
                throw new Error("Validation error of api '" + api.name + "':" + pretty_yaml.stringify(result.errors));
            }
            if (result.warnings) {
                LOGGER.warn("%s", pretty_yaml.stringify(result.warnings));
            }
        });
}

async function transformSpec(api: config.API) {
    LOGGER.debug("Transforming spec of api '%s' to swagger2 format", api.name)
    return Converter.getSpec(api.specification, 'openapi_3')
        .then((fromSpec: any) => fromSpec.convertTo('swagger_2'))
}

function createMetadataEndpoint(spec: any, api: config.API, app: express.Application) {
    LOGGER.debug("Adding metadata endpoint '%s%s'", api.basepath, api.metadata)
    app.get(api.basepath + api.metadata, function (req, res) {
        res.type('text/x-yaml')
        res.status(200)
        res.send(pretty_yaml.stringify(spec))
    });
    app.get(api.basepath + api.metadata + ".json", function (req, res) {
        res.type('application/json')
        res.status(200)
        res.send(spec)
    })
    app.get(api.basepath + api.metadata + ".yaml", function (req, res) {
        res.type('text/x-yaml')
        res.status(200)
        res.send(pretty_yaml.stringify(spec))
    })
}

function createConsole(api: config.API, app: express.Application) {
    LOGGER.debug("Adding console endpoint '%s%s'", api.basepath, "/console")
    app.get(api.basepath + "/console", function (req, res) {
        let html = fs.readFileSync(__dirname + "/resources/console_template.html", 'utf8')
        html = html.replace("OPENAPI", api.basepath + api.metadata + ".json") //only replaces the first instance of OPENAPI.
        html = html.replace("NAME", api.name)
        res.type("text/html")
        res.status(200)
        res.send(html)
    })
}

export { mock }
