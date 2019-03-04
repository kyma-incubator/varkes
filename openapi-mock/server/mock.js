#!/usr/bin/env node
'use strict'

const express = require('express')
const yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const LOGGER = require("./logger").logger
const morgan = require('morgan');
const Converter = require('api-spec-converter');
const middleware = require('swagger-express-middleware');

const DIR_NAME = "./generated/";
const TMP_FILE = "tmp.yaml";

module.exports = async function (config) {
    var app = express()
    for (var i = 0; i < config.apis.length; i++) {
        var api = config.apis[i];
        if (api.type = "openapi") {
            createOauthEndpoint(api, app);
            createConsole(api, app);

            var spec = loadSpec(api)

            if (spec.openapi) {
                var jsonSpec = await transformSpec(api)
                var specString = jsonSpec.stringify({ syntax: "yaml" })
                writeSpec(specString, api, i)
                spec = loadSpec(api)
                spec.basePath = api.baseurl
            }

            await validateSpec(api, 'swagger_2')

            createMetadataEndpoint(spec, api, app);
            createEndpoints(spec, api);

            writeSpec(pretty_yaml.stringify(spec), api, i)

            let myDB = new middleware.MemoryDataStore();
            var middlewares = [];
            middlewares.push(
                middleware(api.specification, app, function (err, middleware) {
                    app.use(
                        middleware.metadata(),
                        middleware.CORS(),
                        middleware.files(),
                        middleware.parseRequest(),
                        middleware.validateRequest(),
                        middleware.mock(myDB),
                    );
                    customErrorResponses(app, config)
                })
            )
            registerLogger(app);
        }
    }

    return app
}

function customErrorResponses(app, config) {
    app.use(function (err, req, res, next) {
        if (!err.status) {
            err.status = 500;
        }
        LOGGER.debug("Converting error response to JSON")
        res.status(err.status);
        res.type('json');
        res.send({ error: err.message })
    });
}

function loadSpec(api) {
    LOGGER.debug("Loading api '%s' from file '%s'", api.name, api.specification);
    return yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'));
}

function writeSpec(specString, api, index) {
    var file_name = DIR_NAME + index + "_" + TMP_FILE;
    LOGGER.debug("Writing api '%s' to file '%s' and length %d", api.name, file_name, specString.length);

    if (!fs.existsSync(DIR_NAME)) {
        fs.mkdirSync(DIR_NAME);
    }

    fs.writeFileSync(file_name, specString);

    api.specification = file_name;
}

function registerLogger(app) {
    morgan.token('header', function (req, res) {
        if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
            return req.rawHeaders;
        else
            return "-";
    });
    morgan.token('body', function (req, res) {
        if (req.body && Object.keys(req.body).length != 0)
            return JSON.stringify(req.body);
        else
            return "-";
    });
    var logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
    var requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
    app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))
    app.get('/requests', function (req, res, done) {
        var text = fs.readFileSync("requests.log", "utf8");
        res.status(200);
        res.send(text);
    });
}

function createEndpoints(spec, api) {
    if (api.hasOwnProperty("added_endpoints")) {
        LOGGER.debug("Adding new Endpoints for api '%s'", api.name);
        api.added_endpoints.forEach(function (point) {
            var endpoint = yaml.safeLoad(fs.readFileSync(point.filePath, 'utf8'));
            if (!spec["paths"].hasOwnProperty(point.url)) {
                LOGGER.debug("Adding custom endpoint '%s' to '%s'", point.url, api.name)
                spec["paths"][point.url] = endpoint;
            }
        });
    }
}
function createOauthEndpoint(api, app) {
    LOGGER.debug("Adding oauth endpoint '%s%s'", api.baseurl, api.oauth)
    app.post(api.baseurl + api.oauth, function (req, res) {
        if (req.body.client_id && req.body.client_secret && req.body.grant_type) {
            res.type('application/json');
            res.status(200);
            res.send({ token: 3333 });
        }
        else {
            var message = "Some of the required parameters are missing";
            res.status(400);
            res.send({ error: message });
        }
    });
}

async function validateSpec(api, type) {
    LOGGER.debug("Validating spec of api '%s'", api.name);
    return Converter.getSpec(api.specification, type)
        .then(function (fromSpec) {
            return fromSpec.validate()
        }).then(function (result) {
            if (result.errors) {
                throw new Error("Validation error of api '" + api.name + "':" + pretty_yaml.stringify(result.errors));
            }
            if (result.warnings) {
                LOGGER.warn("%s", pretty_yaml.stringify(result.warnings));
            }
        });
}

async function transformSpec(api) {
    LOGGER.debug("Transforming spec of api '%s' to swagger2 format", api.name)
    return Converter.getSpec(api.specification, 'openapi_3')
        .then(fromSpec => fromSpec.convertTo('swagger_2'))
}

function createMetadataEndpoint(spec, api, app) {
    LOGGER.debug("Adding metadata endpoint '%s%s'", api.baseurl, api.metadata)
    app.get(api.baseurl + api.metadata, function (req, res) {
        res.type('text/x-yaml')
        res.status(200)
        res.send(pretty_yaml.stringify(spec))
    });
    app.get(api.baseurl + api.metadata + ".json", function (req, res) {
        res.type('application/json')
        res.status(200)
        res.send(spec)
    })
    app.get(api.baseurl + api.metadata + ".yaml", function (req, res) {
        res.type('text/x-yaml')
        res.status(200)
        res.send(pretty_yaml.stringify(spec))
    })
}

function createConsole(api, app) {
    LOGGER.debug("Adding console endpoint '%s%s'", api.baseurl, "/console")
    app.get(api.baseurl + "/console", function (req, res) {
        var html = fs.readFileSync(__dirname + "/resources/console_template.html", 'utf8')
        html = html.replace("OPENAPI", api.baseurl + api.metadata + ".json")
        html = html.replace("NAME", api.name)
        res.type("text/html")
        res.status(200)
        res.send(html)
    })
}