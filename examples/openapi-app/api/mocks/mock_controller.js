'use strict';
var utility = require('../utility/utility')
var yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const util = require('util');
const config = require('../config')
var app = require('express')();
var openApi_doc = {};
var Oauth_endpoint_key = "/authorizationserver/oauth/token";
module.exports = {
    app,
    init: function () {
        openApi_doc = yaml.safeLoad(fs.readFileSync(config.specification_file, 'utf8'));
        return app;

    },
    registerCustomResponses: function (app_modified) {
        app = app_modified;
        app.post(Oauth_endpoint_key, function (req, res, next) {

            console.log(req.body)
            res.send({ token: 3333 })
        });

        app.get('/entity/courses', function (req, res, next) {

            var oldSend = res.send;
            res.send = function (data) {
                console.log(data);
                data = JSON.parse(data);
                data.courses.push({ code: "C3", name: "course3" })
                arguments[0] = JSON.stringify(data);
                oldSend.apply(res, arguments);
            }
            next();
        });
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
    createOAuth2Endpoint: function () {
        var Oauth_endpoint = yaml.safeLoad(fs.readFileSync(config.OAuth_template_path, 'utf8'));
        console.log(Object);
        if (!openApi_doc["paths"].hasOwnProperty(Oauth_endpoint_key)) {
            openApi_doc["paths"][Oauth_endpoint_key] = Oauth_endpoint;
            var yml_format = pretty_yaml.stringify(openApi_doc);
            utility.writeToFile(config.specification_file, yml_format, true);
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
                res.status(err.status);
                res.type('json');
                res.send(util.format(config.error_messages[err.status]));
            }
            catch (err) {
                console.error(err)
            }
        });

    }

};

