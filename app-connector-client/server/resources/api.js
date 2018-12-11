var CONFIG = require("../../config")
const path = require("path")
var request = require("request")
var LOGGER = require("../logger")
const fs = require("fs")

const keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
    , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

exports.index = function (req, res) {
    console.log("local kyma")
    var localKyma = false;
    if (req.query.localKyma == true)
        localKyma = true;
    module.exports.getServices(localKyma, function (data) {
        if (!data)
            res.send({})
        else {
            console.log("services data")
            console.log(data)
            res.send(JSON.parse(data))
        }
    })
};

exports.create = function (req, res) {
    console.log("create");
    const serviceJSON = req.body
    var localKyma = false;
    if (req.query.localKyma == true)
        localKyma = true;
    module.exports.createService(localKyma, serviceJSON, data => {
        res.send(data)
    })
};

exports.show = function (req, res) {
    console.log("show");
    LOGGER.logger.info(req.params.api)
    var localKyma = false;
    if (req.query.localKyma == true)
        localKyma = true;
    showService(localKyma, req.params.api, (data) => {
        try {
            res.send(JSON.parse(data))
        }
        catch (error) {
            res.send({ error: "There is an error on Kyma side" })
        }
    })
};

exports.update = function (req, res) {
    console.log("update");
    var localKyma = false;
    if (req.query.localKyma == true)
        localKyma = true;
    updateService(localKyma, req.params.api, req.body, (data) => {
        res.send(data)
    })
};

exports.destroy = function (req, res) {
    console.log("destroy");
    var localKyma = false;
    if (req.query.localKyma == true)
        localKyma = true;
    module.exports.deleteService(localKyma, req.params.api, (data) => {
        res.send(data)
    })
};

exports.getServices = function getServices(localKyma, cb) {
    console
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
            cb(error)
        }
        LOGGER.logger.info("inside get services")
        LOGGER.logger.info("kyma returned: ")
        LOGGER.logger.info(body)
        cb(body)
    })
}




exports.createService = function createService(localKyma, serviceJSON, cb) {

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
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {
            LOGGER.logger.info("inside create service")
            LOGGER.logger.info("kyma returned: ")
            LOGGER.logger.info(body)
            cb(body)
        });
}



exports.deleteService = function deleteService(localKyma, serviceID, cb) {
    request.delete(
        {
            url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
            rejectUnauthorized: !localKyma
        }, function (error, httpResponse, body) {

            LOGGER.logger.info("inside delete service")
            LOGGER.logger.info("kyma returned: ")
            LOGGER.logger.info(body)
            cb(body)
        }
    )
}

function showService(localKyma, serviceID, cb) {
    LOGGER.logger.info(`Requesting ID: ${serviceID}`)
    request.get({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
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
function updateService(localKyma, serviceID, serviceJSON, cb) {
    request.put({
        url: `${CONFIG.URLs.metadataUrl}/${serviceID}`,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceJSON,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
        rejectUnauthorized: !localKyma
    }, function (error, httpResponse, body) {

        LOGGER.logger.info("inside update service")
        LOGGER.logger.info("kyma returned: ")
        LOGGER.logger.info(body)
        cb(body)
    });
}