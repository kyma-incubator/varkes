var request = require("request")
const fs = require("fs")
const path = require("path")
var LOGGER = require("./logger")
var CONFIG = require("../config")
var forge = require("node-forge")
var https = require("https")
const keysDirectory = path.resolve(CONFIG.keyDir)
var agentOptions = {
    rejectUnauthorized: false
};
var agent = new https.Agent(agentOptions);
module.exports =
    {

        exportKeys: function (localKyma, url, cb) {
            LOGGER.logger.info("exportsKeys")
            var URLs = {}
            request({ //Step 4
                url: url,
                method: "GET",
                rejectUnauthorized: !localKyma
            },
                function (error, response, body) {
                    if (error) {

                        cb(error)
                    }
                    else if (response.statusCode !== 200) cb(new Error(response.statusCode))
                    else if (response.statusCode == 200) {


                        LOGGER.logger.log("info", "Connector received: ", body)
                        URLs = JSON.parse(body).api
                        runOpenSSL(JSON.parse(body).certificate.subject)
                        request.post({ //Step 9
                            url: JSON.parse(body).csrUrl,
                            json: { csr: fs.readFileSync(`${keysDirectory}/test.csr`, "base64") },
                            rejectUnauthorized: !localKyma
                        },
                            function (error, response, body) {
                                if (error) {
                                    cb(error)
                                }
                                else if (response.statusCode == 201) {
                                    CRT_base64_decoded = (new Buffer(body.crt, 'base64').toString("ascii"))
                                    //Step 11
                                    fs.writeFileSync(`${keysDirectory}/kyma.crt`, CRT_base64_decoded)

                                    cb(null, URLs)
                                }
                            }
                        )




                    }
                }
            )
        }
    }

function runOpenSSL(subject) {

    console.log(subject)
    keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
    var privateKey = fs.readFileSync(keyFile, 'utf8')


    var pk = forge.pki.privateKeyFromPem(privateKey)

    var publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    var csr = forge.pki.createCertificationRequest();
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))


    csr.sign(pk)
    fs.writeFileSync(`${keysDirectory}/test.csr`, forge.pki.certificationRequestToPem(csr))


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