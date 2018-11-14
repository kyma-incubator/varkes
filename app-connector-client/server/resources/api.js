var CONFIG = require("../../config")
const path = require("path")
var request = require("request")
var LOGGER = require("../logger")
const fs = require("fs")

const keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
    , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

exports.index = function (req, res) {
    module.exports.getServices(data => {
        res.send(JSON.parse(data))
    })
};

exports.create = function (req, res) {
    const serviceJSON = req.body
    module.exports.createService(serviceJSON, data => {
        res.send(data)
    })
};

exports.show = function (req, res) {
    LOGGER.logger.info(JSON.stringify(req.params))
    showService(req.params.api, (data) => {
        try {
            res.send(JSON.parse(data))
        }
        catch (error) {
            res.send({ error: "There is an error on Kyma side" })
        }
    })
};

exports.update = function (req, res) {
    updateService(req.params.api, req.body, (data) => {
        res.send(data)
    })
};

exports.destroy = function (req, res) {
    module.exports.deleteService(req.params.api, (data) => {
        res.send(data)
    })
};

exports.getServices = function getServices(cb) {
    request.get({
        url: CONFIG.URLs.metadataUrl,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
    }, function (error, httpResponse, body) {
        LOGGER.logger.info("inside get services")
        LOGGER.logger.info("kyma returned: ")
        LOGGER.logger.info(body)
        cb(body)
    })
}




exports.createService = function createService(serviceJSON, cb) {

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
            LOGGER.logger.info("inside create service")
            LOGGER.logger.info("kyma returned: ")
            LOGGER.logger.info(body)
            cb(body)
        });
}



exports.deleteService = function deleteService(serviceID, cb) {
    request.delete(
        {
            url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
        }, function (error, httpResponse, body) {

            LOGGER.logger.info("inside delete service")
            LOGGER.logger.info("kyma returned: ")
            LOGGER.logger.info(body)
            cb(body)
        }
    )
}

function showService(serviceID, cb) {
    LOGGER.logger.info(`Requesting ID: ${serviceID}`)
    request.get({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
    }, function (error, httpResponse, body) {

        LOGGER.logger.info("inside show service")
        LOGGER.logger.info("kyma returned: ")
        LOGGER.logger.info(body)
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

        LOGGER.logger.info("inside update service")
        LOGGER.logger.info("kyma returned: ")
        LOGGER.logger.info(body)
        cb(body)
    });
}