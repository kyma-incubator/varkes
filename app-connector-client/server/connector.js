var request = require("request")
const fs = require("fs")
const path = require("path")
var LOGGER = require("./logger")
var CONFIG = require("./config")
var forge = require("node-forge")
var https = require("https")
const keysDirectory = path.resolve(CONFIG.keyDir)
var agentOptions = {
    rejectUnauthorized: false
};
var agent = new https.Agent(agentOptions);
module.exports =
    {
        connect: function (localKyma, url) {
            return new Promise((resolve, reject) => {
                LOGGER.logger.debug("Connecting ..")
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
                            LOGGER.logger.debug("Connector received: %s", body)
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
                                        LOGGER.logger.info("Connected to %s", URLs.metadataUrl)
                                        resolve(URLs)
                                    }
                                }
                            )
                        }
                    }
                )
            })
        }
    }

function runOpenSSL(subject) {

    LOGGER.logger.debug("Creating CSR usin subject %s", subject)
    keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
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