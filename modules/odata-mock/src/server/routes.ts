#!/usr/bin/env node
'use strict'

const bodyParser = require('body-parser');
const fs = require('fs');

module.exports = function (app: any) {
    app.use(bodyParser.json());
}