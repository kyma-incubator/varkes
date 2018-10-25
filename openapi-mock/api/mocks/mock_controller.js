'use strict';

var utility = require('../utility/utility')
var yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const util = require('util');
const config = require('../../config')
var customResponse;
if (config.hasOwnProperty("customResponsePath") && fs.existsSync(config.customResponsesPath)) {
    try {
        customResponse = require(config.customResponsePath)
    }
    catch (err) {
        console.error(err);
    }
}
var app = require('express')();
var openApi_doc = {};
module.exports = {
    app,
    init: function () {
        openApi_doc = yaml.safeLoad(fs.readFileSync(config.specification_file, 'utf8'));
        return app;

    },
    registerCustomResponses: function (app_modified) {
        app = app_modified;
        console.log("starting custom function");
        if (customResponse)
            customResponse.customResponses(app);

    },
    recordRequest: function (app_modified) {

        utility.registerLogger(app_modified);
    },


    createMetadataEndpoint: function () {
        try {

            app.get('/metadata', function (req, res) {
                res.type('text/x-yaml')
                res.status(200)
                res.send(openApi_doc)
            });

        } catch (e) {
            console.log(e);
        }

    },
    createEndpoints: function () {
        if (config.hasOwnProperty("added_endpoints")) {
            config.added_endpoints.forEach(function (point) {
                console.log("point ");
                console.log(point)
                var Oauth_endpoint = yaml.safeLoad(fs.readFileSync(point.filePath, 'utf8'));
                if (!openApi_doc["paths"].hasOwnProperty(point.url)) {
                    openApi_doc["paths"][point.url] = Oauth_endpoint;
                    var yml_format = pretty_yaml.stringify(openApi_doc);
                    utility.writeToFile(config.specification_file, yml_format, true);
                }
            });
        }
    },
    customErrorResponses: function (app_modified) {

        app = app_modified;
        app.use(function (err, req, res, next) {
            console.log("error status")
            console.log(err.status)
            if (!err.status) {
                err.status = 500;
            }
            try {
                if (config.error_messages.hasOwnProperty(err.status)) {
                    res.status(err.status);
                    res.type('json');
                    res.send(util.format(config.error_messages[err.status]));
                }
            }
            catch (err) {
                console.error(err)
            }
        });

    }

};

