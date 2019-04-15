#!/usr/bin/env node
'use strict'

const openapiApp = require("@varkes/openapi-mock")
const app = require('express')()
const uuid = require('uuid/v4')
const bodyParser = require('body-parser');

var runAsync = async () => {
    var port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        customizeMock(app)
        app.use(await openapiApp.init("./varkes_config.json", __dirname))
        if (port)
            app.listen(port, function () {
                console.info("Started application on port %d", port)
                console.info("Connect to the kyma app using token: " + "http://localhost:" + port + "/connector/v1/applications/signingRequests/info?token=123")
            })
        return app
    } catch (error) {
        console.error("Problem while starting application: %s", error)
    }
}

module.exports = runAsync()

function customizeMock(app) {
    app.use(bodyParser.json());

    app.get('/connector/v1/applications/signingRequests/info', function (req, res, next) {
        console.log("Incoming signing request")
        var localDomain = req.protocol + "://" + req.headers.host

        res.body = {
            csrUrl: localDomain + '/connector/v1/applications/certificates?token=' + "validToken",
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

        next();
    })

    app.post('/metadata/v1/metadata/services', function (req, res, next) {
        if (req.body)
            req.body.id = uuid();

        next();
    })
    app.get("/v1/applications/management/info", (req, res, next) => {
        var localDomain = req.protocol + "://" + req.headers.host
        res.send({
            clientIdentity: { application: 'test' },
            urls:
            {
                eventsUrl: localDomain + "/v1/events",
                metadataUrl:
                    localDomain + "/metadata/v1/metadata/services",
                renewCertUrl:
                    localDomain + "/v1/applications/certificates/renewals",
                revocationCertUrl:
                    localDomain + "/v1/applications/certificates/revocations"
            }

        })
        return
    })
}