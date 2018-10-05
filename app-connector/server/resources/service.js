var CONFIG = require("../../config")
const path = require("path")
var request = require("request")
var LOGGER = require("../logger")
const fs = require("fs")

const keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
    , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

exports.index = function (req, res) {
    getServices(data => {
        res.send(JSON.parse(data))
    })
};

exports.create = function (req, res) {
    const serviceJSON = req.body
    createService(serviceJSON, data => {
        res.send(data)
    })
};

exports.show = function (req, res) {
    showService(req.params.service, (data) => {
        try {
            res.send(JSON.parse(data)) //TODO: add try catch here
        }
        catch (error) {
            res.send({ error: "There is an internal error" })
        }
    })
};

exports.update = function (req, res) {
    updateService(req.params.service, req.body, (data) => {
        res.send(data)
    })
};

exports.destroy = function (req, res) {
    deleteService(req.params.service, (data) => {
        res.send(data)
    })
};

function getServices(cb) {
    request.get({
        url: CONFIG.URLs.metadataUrl,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
    }, function (error, httpResponse, body) {
        cb(body)
    })
}




function createService(serviceJSON, cb) {

    console.log(serviceJSON),
        request.post({
            url: CONFIG.URLs.metadataUrl,
            headers: {
                "Content-Type": "application/json"
            },
            json: serviceJSON,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            }
        }, function (error, httpResponse, body) {
            cb(body)
        });
}



function deleteService(serviceID, cb) {
    request.delete(
        {
            url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
        }, function (error, httpResponse, body) {
            cb(body)
        }
    )
}

function showService(serviceID, cb) {
    request.get({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
    }, function (error, httpResponse, body) {
        cb(body)
    })
}
/**
 * @param {string} serviceID ID of the service to be deleted.
 * @param {function} cb The callback that handles the response.
 */
function updateService(serviceID, serviceJSON, cb) {
    request.put({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceJSON,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {

        cb(body)
    });
}