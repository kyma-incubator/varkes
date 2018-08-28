var request = require("request")
const { exec } = require('child_process')
const fs = require("fs")
const path = require("path")
var CONFIG = require("../config")
const keysDirectory = path.resolve(CONFIG.keyDir)
console.log(keysDirectory)
module.exports =
    {
        exportKeys: function (url, cb) {
            var URLs = {}
            request.get( //Step 4
                url,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {

                        console.log(body)
                        URLs = JSON.parse(body).api
                        runOpenSSL(JSON.parse(body).certificate.subject, function () { //Step 8
                            request.post( //Step 9
                                JSON.parse(body).csrUrl,

                                { json: { csr: fs.readFileSync(`${keysDirectory}/test.csr`, "base64") } },
                                function (error, response, body) {
                                    if (response.statusCode == 201) {
                                        CRT_base64_decoded = (new Buffer(body.crt, 'base64').toString("ascii"))
                                        console.log(CRT_base64_decoded)  //Step 11
                                        fs.writeFileSync(`${keysDirectory}/kyma.crt`, CRT_base64_decoded)

                                        cb(URLs)
                                    }
                                }
                            )
                        })


                    }
                }
            )
        }
    }

function runOpenSSL(subject, cb) {
    subject = "/" + subject.replace(/,/g, "/")
    console.log(subject)
    console.log(`openssl req -new -out ${keysDirectory}/test.csr -key ${keysDirectory}/ec-default.key -subj "${subject}"`)
    exec(`openssl req -new -out ${keysDirectory}/test.csr -key ${keysDirectory}/ec-default.key -subj "${subject}"`, (err, stdout, stderr) => {
        console.log("asdsad")
        cb()
    })
}