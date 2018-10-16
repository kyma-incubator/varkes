var request = require("request")
const { exec } = require('child_process')
const fs = require("fs")
const path = require("path")
var LOGGER = require("./logger")
var CONFIG = require("../config")
var forge = require("node-forge")
const keysDirectory = path.resolve(CONFIG.keyDir)
module.exports =
    {
        exportKeys: function (url, cb) {
            var URLs = {}
            request.get( //Step 4
                url,
                function (error, response, body) {
                    if (error) throw error
                    else if (response.statusCode !== 200) throw response.statusCode
                    else if (response.statusCode == 200) {


                        LOGGER.logger.log("info", "Connector received: ", body)
                        URLs = JSON.parse(body).api
                        runOpenSSL(JSON.parse(body).certificate.subject)
                        request.post( //Step 9
                            JSON.parse(body).csrUrl,

                            { json: { csr: fs.readFileSync(`${keysDirectory}/test.csr`, "base64") } },
                            function (error, response, body) {
                                if (response.statusCode == 201) {
                                    CRT_base64_decoded = (new Buffer(body.crt, 'base64').toString("ascii"))
                                    //Step 11
                                    fs.writeFileSync(`${keysDirectory}/kyma.crt`, CRT_base64_decoded)

                                    cb(URLs)
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
    var privateKey = fs.readFileSync(`${keysDirectory}/ec-default.key`, 'utf8')


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