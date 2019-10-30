#!/usr/bin/env node
'use strict'

const bodyParser = require('body-parser');
const morgan = require('morgan')
const fs = require('fs');

module.exports = function (app: any) {
    registerLogger(app);
    let apis = app.varkesConfig.apis;

    function registerLogger(app: any) {
        morgan.token('header', function (req: any, res: any) {
            if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
                return req.rawHeaders;
            else
                return "-";
        });
        morgan.token('body', function (req: any, res: any) {
            if (req.body && Object.keys(req.body).length != 0)
                return JSON.stringify(req.body);
            else
                return "-";
        });
        let logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
        let requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
        app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))
    }

    app.use(bodyParser.json());
}