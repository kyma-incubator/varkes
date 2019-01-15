#!/usr/bin/env node
var CONFIG = require("./config")
const path = require("path")
var request = require("request")
var LOGGER = require("./logger").logger
const fs = require("fs")

var apiRouter = require("express").Router()

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

function getAll(req, res) {
    LOGGER.debug("Getting all APIs")

    getAPIs(req.query.localKyma == true, function (data, err) {
        if (err) {
            LOGGER.error("Error while getting all APIs: %s", err)
            res.status(500).send(err)
        } else if (!data) {
            res.status(200).send([])
        } else {
            try {
                LOGGER.debug("Received API data: %s", data)
                res.status(200).send(JSON.parse(data))
            }
            catch (err2) {
                LOGGER.error("Error while parsing response payload: %s", err2)
                res.status(200).send(data)
            }
        }
    })
};

function create(req, res) {
    LOGGER.debug("Creating API")

    createAPI(req.query.localKyma == true, req.body, function (data, err) {
        if (err) {
            LOGGER.error("Error while creating API: %s", err)
            res.status(500).send(err)
        } else if (!data) {
            res.status(200).send({})
        } else {
            try {
                LOGGER.debug("Received API data: %s", data)
                res.status(200).send(JSON.parse(data))
            }
            catch (err2) {
                LOGGER.error("Error while parsing response payload: %s", err2)
                res.status(200).send(data)
            }
        }
    })
};

function get(req, res) {
    LOGGER.debug("Get API %s", req.params.api)

    getAPI(req.query.localKyma == true, req.params.api, function (data, err) {
        if (err) {
            LOGGER.error("Error while getting API: %s", err)
            res.status(500).send(err)
        } else if (!data) {
            res.status(200).send({})
        } else {
            try {
                LOGGER.debug("Received API data: %s", data)
                res.status(200).send(JSON.parse(data))
            }
            catch (err2) {
                LOGGER.error("Error while parsing response payload: %s", err2)
                res.status(200).send(data)
            }
        }
    })
};

function update(req, res) {
    LOGGER.debug("Update API %s", req.params.api)

    updateAPI(req.query.localKyma == true, req.params.api, req.body, function (data, err) {
        if (err) {
            LOGGER.error("Error while updating API: %s", err)
            res.status(500).send(err)
        } else if (!data) {
            res.status(200).send({})
        } else {
            try {
                LOGGER.debug("Received API data: %s", data)
                res.status(200).send(JSON.parse(data))
            }
            catch (err2) {
                LOGGER.error("Error while parsing response payload: %s", err2)
                res.status(200).send(data)
            }
        }
    })
};

function deleteFunc(req, res) {
    LOGGER.debug("Delete API %s", req.params.api)

    deleteAPI(req.query.localKyma == true, req.params.api, req.body, function (data, err) {
        if (err) {
            LOGGER.error("Error while deleting API: %s", err)
            res.status(500).send(err)
        } else {
            LOGGER.debug("Received API data: %s", data)
            res.status(204).send()
        }
    })
};

function deleteAll(req, res) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Creating API with payload: %s", payload)

        deleteAPIs(req.query.localKyma == true, req.params.api, function (data, err) {
            if (err) {
                LOGGER.error("Error while deleting APIs: %s", err)
                res.status(500).send(err)
            } else {
                res.status(204).send()
            }
        })
    }
};

function createAPI(localKyma, payload, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Creating API: %s", payload.name)

        request.post({
            url: CONFIG.URLs.metadataUrl,
            headers: {
                "Content-Type": "application/json"
            },
            json: payload,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                cb(null, error)
            }
            if (httpResponse.statusCode != 200) {
                cb(null, body)
            }
            cb(body, null)
        });
    }
}

function deleteAPI(localKyma, id, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Deleting API: %s", id)
        request.delete(
            {
                url: `${CONFIG.URLs.metadataUrl}/${id}`,
                agentOptions: {
                    cert: fs.readFileSync(certFile),
                    key: fs.readFileSync(keyFile)
                },
                rejectUnauthorized: !localKyma
            }, function (error, httpResponse, body) {
                if (error) {
                    cb(null, error)
                }
                cb(body, null)
            }
        )
    }
}

function deleteAPIs(localKyma, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Deleting all APIs")
        request.delete(
            {
                url: `${CONFIG.URLs.metadataUrl}`,
                agentOptions: {
                    cert: fs.readFileSync(certFile),
                    key: fs.readFileSync(keyFile)
                },
                rejectUnauthorized: !localKyma
            }, function (error, httpResponse, body) {
                if (error) {
                    cb(null, error)
                }
                cb(body, null)
            }
        )
    }
}

function getAPIs(localKyma, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Retrieving all APIs")
        request({
            url: CONFIG.URLs.metadataUrl,
            method: "GET",
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                cb(null, error)
            }
            cb(body, null)
        })
    }
}

function getAPI(localKyma, id, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Retrieving API: %s", id)
        request.get({
            url: `${CONFIG.URLs.metadataUrl}/${id}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                cb(null, error)
            }
            cb(body, null)
        })
    }
}

function updateAPI(localKyma, id, payload, cb) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Updating API: %s", id)
        request.put({
            url: `${CONFIG.URLs.metadataUrl}/${id}`,
            headers: {
                "Content-Type": "application/json"
            },
            json: payload,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {
            if (error) {
                cb(null, error)
            }
            cb(body, null)
        });
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
apiRouter.delete("/", deleteAll)

apiRouter.get("/:api", get)
apiRouter.put("/:api", update)
apiRouter.delete("/:api", deleteFunc)

//Router specific logging middleware
apiRouter.use(function (req, res, next) {
    LOGGER.debug("In API Router: ", req)
    next()
})
module.exports = apiRouter
