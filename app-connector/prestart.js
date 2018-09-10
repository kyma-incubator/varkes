const fs = require("fs")
var cp = require("child_process")
var CONFIG = require("./config")
const path = require("path")
var LOGGER = require("./server/logger")
!fs.existsSync("keys") ? fs.mkdirSync("keys") : {}


require.main === module ? generatePrivateKey(data => console.log(data)) : console.log("required")


//Generate Key if not exists
function generatePrivateKey(cb) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path.resolve(CONFIG.keyDir, "ec-default.key"))) {
            cp.exec("openssl genrsa -out keys/ec-default.key 2048", (err, stdout, stderr) => {
                err ? console.log(err) : console.log(stdout)

                LOGGER.logger.log("info", "Private key generated")
                resolve()
            })
        } else {
            LOGGER.logger.log("info", "Private key exists ")
            resolve()
        }
    })
}
module.exports = {
    generatePrivateKey: generatePrivateKey
}
