var request = require("request")
const fs = require("fs")
const path = require("path")
var LOGGER = require("./logger").logger
var CONFIG = require("./config")
var forge = require("node-forge")
var https = require("https")
const url = require("url")

const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)

const keysDirectory = path.resolve(CONFIG.keyDir)
var agentOptions = {
    rejectUnauthorized: false
};
var agent = new https.Agent(agentOptions);
module.exports =
    {
        connect: function (localKyma, url) {
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
        },
        disconnect: function (req, res) {
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
        },
        info: function (req, res) {
            info = createInfo()
            if (info) {
                res.status(200).send(info)
            } else {
                res.status(404).send("Not connected to a Kyma cluster")
            }
        },
        key: function (req, res) {
            res.download(keyFile)
        },
        cert: function (req, res) {
            res.download(certFile)
        }
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