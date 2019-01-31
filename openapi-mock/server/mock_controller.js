'use strict';

var utility = require('./utility')
var yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const util = require('util');
const LOGGER = require("./logger").logger
var morgan = require('morgan');

const DIR_NAME = "./generated/";
const TMP_FILE = "tmp.yaml";
const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";
var config;

module.exports = {
    init: function (app, configObj) {
        config = configObj;
        for (var i = 0; i < config.apis.length; i++) {
            var api = config.apis[i];
            var openApi_doc = yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'));
            var oauthEndpoint = api.oauth ? api.oauth : OAUTH;
            var metadataEndpoint = api.metadata ? api.metadata : METADATA;
            createOauthEndpoint(oauthEndpoint, api, app);
            createMetadataEndpoint(openApi_doc, metadataEndpoint, api, app);
            createConsole(openApi_doc, api, app);
            createEndpoints(openApi_doc, api);
        }
    },
    recordRequest: function (app) {
        registerLogger(app);
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

function createEndpoints(openApi_doc, api) {
    if (api.hasOwnProperty("added_endpoints")) {
        var file_name = DIR_NAME + api.name + "_" + TMP_FILE;
        LOGGER.debug("Adding new Endpoints for api %s and creating new openapi file %s", api.name, file_name);
        if (!fs.existsSync(DIR_NAME))
            fs.mkdirSync(DIR_NAME);
        api.specification = file_name;
        api.added_endpoints.forEach(function (point) {
            var endpoint = yaml.safeLoad(fs.readFileSync(point.filePath, 'utf8'));
            if (!openApi_doc["paths"].hasOwnProperty(point.url)) {
                LOGGER.debug("Adding custom endpoint %s to %s", point.url, api.name)
                openApi_doc["paths"][point.url] = endpoint;
            }
        });
        var yml_format = pretty_yaml.stringify(openApi_doc);
        utility.writeToFile(file_name, yml_format, true);
    }
}
function createOauthEndpoint(oauth_endpoint, api, app) {
    LOGGER.error("Registered %s%s", api.baseurl, oauth_endpoint)
    app.post(api.baseurl + oauth_endpoint, function (req, res) {
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

function createMetadataEndpoint(openApi_doc, metadata_endpoint, api, app) {
    app.get(api.baseurl + metadata_endpoint, function (req, res) {
        res.type('text/x-yaml')
        res.status(200)
        res.send(openApi_doc)
    });
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