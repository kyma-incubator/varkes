#!/usr/bin/env node
var CONFIG = require("../app-connector-config.json")
const path = require("path")
var request = require("request")
var LOGGER = require("../logger").logger
const fs = require("fs")

var apiRouter = require("express").Router()

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)
function getAll(req, res) {
    LOGGER.debug("Getting all APIs")
    err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        apiRouter.getAllAPIs(req.query.localKyma, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting all APIs: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting all API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data")
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};
apiRouter.getAllAPIs = function (localKyma, cb) {
    request({
        url: CONFIG.URLs.metadataUrl,
        method: "GET",
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });
};
apiRouter.createAPI = function (localKyma, serviceMetadata, cb) {

    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });

};
apiRouter.updateAPI = function (localKyma, serviceMetadata, api_id, cb) {
    request.put({
        url: `${CONFIG.URLs.metadataUrl}/${api_id}`,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {
        cb(error, httpResponse, body);
    });

};
function create(req, res) {
    LOGGER.debug("Creating API %s", req.body.name)
    err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        apiRouter.createAPI(req.query.localKyma, req.body, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while creating API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while creating API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};

function get(req, res) {
    LOGGER.debug("Get API %s", req.params.api)
    err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.get({
            url: `${CONFIG.URLs.metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while getting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while getting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
};

function update(req, res) {
    LOGGER.debug("Update API %s", req.params.api)
    err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        apiRouter.updateAPI(req.query.localKyma, req.body, req.params.api,
            function (error, httpResponse, body) {
                if (error) {
                    LOGGER.error("Error while updating API: %s", error)
                    res.status(500).send({ error: error.message })
                } else if (httpResponse.statusCode >= 400) {
                    LOGGER.error("Error while updating API: %s", JSON.stringify(body))
                    res.status(httpResponse.statusCode).type("json").send(body)
                } else {
                    LOGGER.debug("Received API data: %s", JSON.stringify(body))
                    res.status(httpResponse.statusCode).type("json").send(body)
                }
            })
    }
};

function deleteApi(req, res) {
    LOGGER.debug("Delete API %s", req.params.api)
    err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        request.delete({
            url: `${CONFIG.URLs.metadataUrl}/${req.params.api}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !req.query.localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                LOGGER.error("Error while deleting API: %s", error)
                res.status(500).send({ error: error.message })
            } else if (httpResponse.statusCode >= 400) {
                LOGGER.error("Error while deleting API: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            } else {
                LOGGER.debug("Received API data: %s", JSON.stringify(body))
                res.status(httpResponse.statusCode).type("json").send(body)
            }
        })
    }
}

function assureConnected() {
    if (CONFIG.URLs.metadataUrl == "") {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}

apiRouter.get("/", getAll)
apiRouter.post("/", create)

apiRouter.get("/:api", get)
apiRouter.put("/:api", update)
apiRouter.delete("/:api", deleteApi)

module.exports = apiRouter
