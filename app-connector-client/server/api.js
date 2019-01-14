#!/usr/bin/env node
var CONFIG = require("./config")
const path = require("path")
var request = require("request")
var LOGGER = require("./logger").logger
const fs = require("fs")

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

exports.getAll = function (req, res) {
    LOGGER.debug("Getting all APIs")

    module.exports.getAPIs(req.query.localKyma == true, function (data, err) {
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

exports.create = function (req, res) {
    LOGGER.debug("Creating API")

    module.exports.createAPI(req.query.localKyma == true, req.body, function (data, err) {
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

exports.get = function (req, res) {
    LOGGER.debug("Get API %s", req.params.api)

    module.exports.getAPI(req.query.localKyma == true, req.params.api, function (data, err) {
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

exports.update = function (req, res) {
    LOGGER.debug("Update API %s", req.params.api)

    module.exports.updateAPI(req.query.localKyma == true, req.params.api, req.body, function (data, err) {
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

exports.delete = function (req, res) {
    LOGGER.debug("Delete API %s", req.params.api)

    module.exports.deleteAPI(req.query.localKyma == true, req.params.api, req.body, function (data, err) {
        if (err) {
            LOGGER.error("Error while deleting API: %s", err)
            res.status(500).send(err)
        } else {
            LOGGER.debug("Received API data: %s", data)
            res.status(204).send()
        }
    })
};

exports.deleteAll = function (req, res) {
    err = assureConnected()
    if (err) {
        cb(null, err)
    } else {
        LOGGER.debug("Creating API with payload: %s", payload)

        module.exports.deleteAPIs(req.query.localKyma == true, req.params.api, function (data, err) {
            if (err) {
                LOGGER.error("Error while deleting APIs: %s", err)
                res.status(500).send(err)
            } else {
                res.status(204).send()
            }
        })
    }
};

exports.createAPI = function createAPI(localKyma, payload, cb) {
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
            if(httpResponse.statusCode!=200){
                cb(null, body)
            }
            cb(body, null)
        });
    }
}

exports.deleteAPI = function deleteAPI(localKyma, id, cb) {
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

exports.deleteAPIs = function deleteAPIs(localKyma, cb) {
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

exports.getAPIs = function getAPIs(localKyma, cb) {
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

exports.getAPI = function getAPI(localKyma, id, cb) {
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

exports.updateAPI = function updateAPI(localKyma, id, payload, cb) {
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