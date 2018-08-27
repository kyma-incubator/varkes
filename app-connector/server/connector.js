var request = require("request")
const { exec } = require('child_process')
const fs = require("fs")
const keysDirectory = "../keys/"
module.exports = 
{
    exportKeys : function(url){
        request.get( //Step 4
            url,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                    runOpenSSL(JSON.parse(body).certificate.subject, function (data) { //Step 8
                        request.post( //Step 9
                            JSON.parse(body).csrUrl,
                            { json: { csr: data } },
                            function (error, response, body) {
                                if (response.statusCode == 201) {
                                    CRT_base64_decoded = (new Buffer(body.crt, 'base64').toString("ascii"))
                                    console.log(CRT_base64_decoded)  //Step 11
                                    fs.writeFileSync(keysDirectory+"kyma.crt", CRT_base64_decoded)
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
    exec(`openssl.exe req -new -out ../keys/test.csr -key ../keys/ec-default.key -subj "${subject}"`, (err, stdout, stderr) => {
        console.log("asdsad")
        cb(fs.readFileSync("../keys/test.csr", "base64"))
    })
}