#!/usr/bin/env node
'use strict'

const openapiApp = require("varkes-openapi-mock")
const app = require('express')()

var runAsync = async () => {
    var port
    if (process.argv.length > 2) {
        port = process.argv[2]
    }

    try {
        customizeMock(app)
        app.use(await openapiApp("./varkes_config.json"))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
            })
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()

function customizeMock(app){
    app.get('/connector/v1/health', function (req, res, next) {
        var localDomain = req.protocol +"://"+ req.headers.host

        res.body = {
            csrUrl:  localDomain + '/connector/v1/applications/certificates?token=' + "validToken",
            api: {
                metadataUrl: localDomain + '/metadata/v1/metadata/services',
                eventsUrl: localDomain + '/events/v1/events',
                certificatesUrl: localDomain + '/metadata/v1/applications/certificates',
                infoUrl: localDomain + '/v1/applications/management/info'
            },
            certificate: {
                subject: 'OU=Test,O=Test,L=Blacksburg,ST=Virginia,C=US,CN={TENANT}{GROUP}{APP_NAME}',
                extensions: {},
                "key-algorithm": 'rsa2048'
            }
        };

        // Let the Mock middleware apply usual chain
        next();
    });
    return app
}