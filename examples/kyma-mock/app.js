#!/usr/bin/env node
'use strict'

const mock = require("@varkes/openapi-mock")
const config = require("@varkes/configuration")
const app = require('express')()
const { v4: uuid } = require('uuid');
const bodyParser = require('body-parser');

let runAsync = async () => {
    let port
    if (process.argv.length > 2 && parseInt(process.argv[2])) {
        port = process.argv[2]
    }

    try {
        customizeMock(app)
        let configuration = await config.resolveFile("./varkes_config.json", __dirname)
        app.use(await mock.init(configuration))
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
        let localDomain = req.protocol + "://" + req.headers.host

        res.body = {
            csrUrl: localDomain + '/connector/v1/applications/certificates?token=' + "validToken",
            api: {
                metadataUrl: localDomain + '/metadata/v1/metadata/services',
                eventsUrl: localDomain + '/events/v1/events',
                cloudeventsUrl: localDomain + '/events/events',
                certificatesUrl: localDomain + '/metadata/v1/applications/certificates',
                infoUrl: localDomain + '/connector/v1/applications/management/info'
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
    app.get("/connector/v1/applications/management/info", (req, res, next) => {
        let localDomain = req.protocol + "://" + req.headers.host
        res.send({
            clientIdentity: { application: 'test' },
            urls:
            {
                eventsUrl: localDomain + "/events/v1/events",
                cloudeventsUrl: localDomain + "events/events",
                metadataUrl:
                    localDomain + "/metadata/v1/metadata/services",
                renewCertUrl:
                    localDomain + "/connector/v1/applications/certificates/renewals",
                revocationCertUrl:
                    localDomain + "/connector/v1/applications/certificates/revocations"
            }

        })
        return
    })
}
