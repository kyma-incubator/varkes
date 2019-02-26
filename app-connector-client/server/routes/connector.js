var request = require("request")
const fs = require("fs")
const path = require("path")
var LOGGER = require("../logger").logger
var CONFIG = require("../app-connector-config.json")
var forge = require("node-forge")
const url = require("url")
const services = require("./services")
const events = require("./events")
var express = require("express")

var nodePort;
var varkesConfig;
const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)


const keysDirectory = path.resolve(CONFIG.keyDir)

function authenticateToKyma(localKyma, url) {
    return new Promise((resolve, reject) => {
        LOGGER.debug("Connecting ..")
        var URLs = {}
        request({ //Step 4
            url: url,
            method: "GET",
            rejectUnauthorized: !localKyma
        },
            function (error, response, body) {
                if (error) {
                    reject(error)
                }
                else if (response.statusCode !== 200) reject(new Error(response.statusCode))
                else if (response.statusCode == 200) {
                    LOGGER.debug("Connector received: %s", body)
                    URLs = JSON.parse(body).api
                    runOpenSSL(JSON.parse(body).certificate.subject)
                    request.post({ //Step 9
                        url: JSON.parse(body).csrUrl,
                        json: { csr: fs.readFileSync(`${keysDirectory}/${CONFIG.csrFile}`, "base64") },
                        rejectUnauthorized: !localKyma
                    },
                        function (error, response, body) {
                            if (error) {
                                reject(error)
                            }
                            else if (response.statusCode == 201) {
                                CRT_base64_decoded = (Buffer.from(body.crt, 'base64').toString("ascii"))
                                //Step 11
                                fs.writeFileSync(`${keysDirectory}/${CONFIG.crtFile}`, CRT_base64_decoded)
                                LOGGER.info("Connected to %s", URLs.metadataUrl)
                                resolve(URLs)
                            }
                        }
                    )
                }
            }
        )
    })
}
function disconnect(req, res) {
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))
    }
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))
    }
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))
    }
    CONFIG.URLs = {
        metadataUrl: "",
        eventsUrl: "",
        certificatesUrl: ""
    }

    res.status(204).send()
}
function info(req, res) {
    info = createInfo()
    if (info) {
        res.status(200).send(info)
    } else {
        res.status(400).send({ error: "Not connected to a Kyma cluster" })
    }
}
function key(req, res) {
    res.download(keyFile)
}
function cert(req, res) {
    res.download(certFile)
}

function createInfo() {
    if (CONFIG.URLs.metadataUrl !== "") {
        const myURL = new url.URL(CONFIG.URLs.metadataUrl)
        response = {
            "cluster_domain": "",
            "re_name": "",
            "eventsUrl": "",
            "metadataUrl": ""
        }
        response.cluster_domain = myURL.hostname.split(".")[1]
        response.re_name = myURL.pathname.split("/")[1]
        response.eventsUrl = CONFIG.URLs.eventsUrl;
        response.metadataUrl = CONFIG.URLs.metadataUrl;
        return response
    }
    return null
}

function runOpenSSL(subject) {

    LOGGER.debug("Creating CSR using subject %s", subject)
    var privateKey = fs.readFileSync(keyFile, 'utf8')
    var pk = forge.pki.privateKeyFromPem(privateKey)
    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest();
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    fs.writeFileSync(`${keysDirectory}/${CONFIG.csrFile}`, forge.pki.certificationRequestToPem(csr))
}

function parseSubjectToJsonArray(subject) {
    var subjectsArray = []
    subject.split(",").map(el => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray
}

async function connect(req, res) {
    if (!req.body) res.sendStatus(400);

    try {
        data = await authenticateToKyma(req.query.localKyma, req.body.url)

        if (req.query.localKyma == true) {
            var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + nodePort);
        }
        CONFIG.URLs = data
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")

        if (req.body.register) {
            LOGGER.debug("Auto-register APIs")
            var hostname = req.body.hostname || "http://localhost"
            var registeredApis = await services.getAllAPI(req.query.localKyma);
            registeredApis = await services.createServicesFromConfig(req.query.localKyma, hostname, varkesConfig.apis, registeredApis)
            await events.createEventsFromConfig(req.query.localKyma, varkesConfig.events, registeredApis);
            LOGGER.debug("Auto-registered %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        }

        info = createInfo()
        if (info) {
            res.status(200).send(info)
        } else {
            res.status(400).send({ error: "Not connected to a Kyma cluster" })
        }

    } catch (error) {
        message = "There is an error while registering.\n Please make sure that your token is unique"
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.statusCode = 401
        res.send(message)
    }
}

module.exports = function (config, nodePortParam = null) {
    varkesConfig = config;
    nodePort = nodePortParam;

    var connectionRouter = express.Router()
    connectionRouter.get("/", info)
    connectionRouter.delete("/", disconnect)
    connectionRouter.get("/key", key)
    connectionRouter.get("/cert", cert)
    connectionRouter.post("/", connect)

    return connectionRouter;
}