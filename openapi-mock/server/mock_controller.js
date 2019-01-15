'use strict';

var utility = require('./utility')
var yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const util = require('util');
const LOGGER = require("./logger").logger

var config;

module.exports = {
    init: function (app, configObj) {
        config = configObj;
        for (var i = 0; i < config.apis.length; i++) {
            var api = config.apis[i];
            var openApi_doc = yaml.safeLoad(fs.readFileSync(api.specification_file, 'utf8'));
            createMetadataEndpoint(openApi_doc, api, app);
            createEndpoints(openApi_doc, api);
            createConsole(openApi_doc, api, app);
        }
    },
    recordRequest: function (app) {
        utility.registerLogger(app);
    },
    customErrorResponses: function (app) {
        app.use(function (err, req, res, next) {
            if (!err.status) {
                err.status = 500;
            }
            if (config.error_messages && config.error_messages.hasOwnProperty(err.status)) {
                LOGGER.debug("Applying configured custom error message for error code %d", err.status)
                res.status(err.status);
                res.type('json');
                res.send(util.format(config.error_messages[err.status]));
            } else {
                LOGGER.debug("Converting error response to JSON")
                res.status(err.status);
                res.type('json');
                res.send({ error: err.message })
            }
        });
    }
};

function createEndpoints(openApi_doc, api) {
    if (api.hasOwnProperty("added_endpoints")) {
        api.added_endpoints.forEach(function (point) {
            var endpoint = yaml.safeLoad(fs.readFileSync(point.filePath, 'utf8'));
            if (!openApi_doc["paths"].hasOwnProperty(point.url)) {
                LOGGER.debug("Adding custom endpoint %s to %s", point.url, api.name)
                openApi_doc["paths"][point.url] = endpoint;
                var yml_format = pretty_yaml.stringify(openApi_doc);
                utility.writeToFile(api.specification_file, yml_format, true);
            }
        });
    }
}
function createMetadataEndpoint(openApi_doc, api, app) {
    try {
        app.get(api.baseurl + api.metadata, function (req, res) {
            res.type('text/x-yaml')
            res.status(200)
            res.send(openApi_doc)
        });
        var endpoint = yaml.safeLoad(fs.readFileSync(__dirname + "/resources/OAuth_template.yaml", 'utf8'));
        if (!openApi_doc["paths"].hasOwnProperty(api.oauth)) {
            openApi_doc["paths"][api.oauth] = endpoint;
            var yml_format = pretty_yaml.stringify(openApi_doc);
            utility.writeToFile(api.specification_file, yml_format, true);
        }
    } catch (e) {
        LOGGER.error("Error while enriching swaggers with oauth endpoints: %s", e)
    }
}

function createConsole(openApi_doc, api, app) {
    app.get(api.baseurl + "/console", function (req, res) {
        var html = fs.readFileSync(__dirname + "/resources/console_template.html", 'utf8')
        html = html.replace("OPENAPI", api.baseurl + api.metadata)
        html = html.replace("NAME", api.baseurl + api.name)
        res.type("text/html")
        res.status(200)
        res.send(html)
    })
}