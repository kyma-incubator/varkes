'use strict';

var utility = require('../utility/utility')
var yaml = require('js-yaml');
const fs = require('fs');
const util = require('util');
var app = require('express')();
module.exports = {
    app,
    init: function () {
        return app;

    },
    registerCustomResponses: function (app_modified) {
        app = app_modified;
        console.log("starting custom function");
        app.post('/:baseSiteId/cms/components', function (req, res, next) {

            console.log("entered post");
            res.body = {
                "idList": [
                    "4",
                    "5"
                ]
            }
            next();
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
            var doc = yaml.safeLoad(fs.readFileSync('api/swagger/swagger.yaml', 'utf8'));
            app.get('/metadata', function (req, res) {
                res.type('text/x-yaml')
                res.status(200)
                res.send(doc)
            });

        } catch (e) {
            console.log(e);
        }

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
            else if (err.status = 400) {
                res.status(err.status);
                res.type('json');
                res.send(util.format('{error:\"Errorrrr\"}', err.status, err.message));
            }
        });

    }

};

