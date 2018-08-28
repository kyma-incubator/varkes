var CONFIG = require("../../config")
const path = require("path")
var request = require("request")
const fs = require("fs")

var keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
    , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')
    , serviceMetadata = path.resolve(CONFIG.assetDir, "basic-service-metadata.json")


exports.index = function (req, res) {
    getServices(data => {
        res.send(JSON.parse(data))
    })
};

exports.create = function (req, res) {
    deployService(data => {
        res.send(JSON.parse(data))
    })
};

exports.show = function (req, res) {
    showService(req.params.service, (data) => {
        res.send(JSON.parse(data))
    })
};

exports.update = function (req, res) {
    updateService(req.params.service, (data) => {
        res.send(JSON.parse(data))
    })
};

exports.destroy = function (req, res) {
    deleteService(req.params.service, (data) => {
        res.send(data)
    })
};

function getServices(cb) {
    console.log(CONFIG.URLs.metadataUrl)
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




function deployService(cb) {
    console.log(CONFIG.URLs.metadataUrl)
    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        body: fs.readFileSync(serviceMetadata),
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {
        console.log(error)
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
function updateService(serviceID, cb) {
    request.put({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        headers: {
            "Content-Type": "application/json"
        },
        body: fs.readFileSync(serviceMetadata),
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {
        console.log(error)
        cb(body)
    });
}