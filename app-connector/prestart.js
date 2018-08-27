const fs = require("fs")
var cp = require("child_process")
var CONFIG = require("./config")
!fs.existsSync("keys") ? fs.mkdirSync("keys") : {}


if (!fs.existsSync(`${CONFIG.keyDir}/ec-default.key`)) {
    cp.exec("openssl genrsa -out keys/ec-default.key 2048", (err, stdout, stderr) => {
        err ? console.log(err) : console.log(stdout)
    })
} else {
    console.log("private key already exists")
}
