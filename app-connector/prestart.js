const fs = require("fs")
var cp = require("child_process")
var CONFIG = require("./config")
const path = require("path")
var LOGGER = require("./server/logger")
!fs.existsSync("keys") ? fs.mkdirSync("keys") : {}

//Generate Key if not exists
if (!fs.existsSync(path.resolve(CONFIG.keyDir, "ec-default.key"))) {
    cp.exec("openssl genrsa -out keys/ec-default.key 2048", (err, stdout, stderr) => {
        err ? console.log(err) : console.log(stdout)

        LOGGER.logger.log("info", "Private key generated")
    })
} else {
    LOGGER.logger.log("info", "Private key exists ")
}
