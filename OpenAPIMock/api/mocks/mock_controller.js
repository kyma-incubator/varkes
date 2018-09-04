'use strict';

var utility = require('../utility/utility')
var yaml = require('js-yaml');
const fs = require('fs');
const pretty_yaml = require('json-to-pretty-yaml');
const util = require('util');
var app = require('express')();
var openApi_doc = {};
var Oauth_endpoint_key = "/authorizationserver/oauth/token"
module.exports = {
    app,
    init: function () {
        openApi_doc = yaml.safeLoad(fs.readFileSync('api/swagger/swagger.yaml', 'utf8'));
        return app;

    },
    registerCustomResponses: function (app_modified) {
        app = app_modified;
        console.log("starting custom function");
        app.post('/:baseSiteId/cms/components', function (req, res, next) {

            console.log("entered post");
            res.body.idList.push("4")
            res.body = {
                "idList": [
                    "4",
                    "5"
                ]
            }
            next();
        });
        app.get('/authorizationserver/oauth/token', function (req, res, next) {

            console.log("entered oauth");
            console.log(req.swagger.operation.responses[200].schema.default)
            res.type('application/json')
            res.status(200)
            res.send({ access_token_url: req.query.redirect_uri + "/#token=2223" })
        });

        app.get('/:baseSiteId/cardtypes', function (req, res, next) {

            console.log("entered cardtypes");
            var cardTypes = req.swagger.operation.responses[200].schema.default.cardTypes;
            cardTypes.push({ code: "code3", name: "card3" })
            res.type('application/json')
            res.status(200)
            res.send({ "cardTypes": cardTypes })
        });

    },
    recordRequest: function () {

        app.use(function (req, res, next) {
            console.log("logging");
            var requestslog = "URL:\n" + req.url + "\n" + utility.getCurrentDateTime() + "\nHEADER: \n";
            requestslog += req.rawHeaders;
            if (Object.keys(req.body).length != 0) {
                console.log("body")
                requestslog += "\nBODY: \n" + JSON.stringify(req.body);
            }
            requestslog += "\n============================================\n";
            utility.writeToFile("requests.log", requestslog);
            next();
        });

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
        var Oauth_endpoint = yaml.safeLoad(fs.readFileSync('api/swagger/OAuth_template.yaml', 'utf8'));
        openApi_doc["paths"][Oauth_endpoint_key] = Oauth_endpoint;
        var openAPIDoc_string = JSON.stringify(openApi_doc)
        utility.writeToFile("api/swagger/trial.json", openAPIDoc_string, true);
        var yml_format = pretty_yaml.stringify(openApi_doc);
        utility.writeToFile("api/swagger/swagger.yaml", yml_format, true);
    },
    customErrorResponses: function (app_modified) {

        app = app_modified;
        app.use(function (err, req, res, next) {
            console.log("error status")
            console.log(err.status)
            if (!err.status) {
                res.status(500);
                res.type('json');
                res.send(util.format('{error:\"Something went Wrong\"}'));
            }
            else if (err.status == 400) {
                res.status(err.status);
                res.type('json');
                res.send(util.format('{error:\"Errorrrr\"}', err.status, err.message));
            }
        });

    }

};

