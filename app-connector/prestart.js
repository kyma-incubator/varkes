const fs = require("fs")
var CONFIG = require("./config")
const path = require("path")
var LOGGER = require("./server/logger")
var forge = require("node-forge")
!fs.existsSync("keys") ? fs.mkdirSync("keys") : {}


require.main === module ? generatePrivateKey() : console.log("required")


//Generate Key if not exists
function generatePrivateKey() {

    if (!fs.existsSync(path.resolve(CONFIG.keyDir, "ec-default.key"))) {
        var keys = forge.pki.rsa.generateKeyPair(2048);
        const privateKey =
            forge.pki.privateKeyToPem(keys.privateKey)

        fs.writeFileSync("keys/ec-default.key", privateKey)
    } else {
        LOGGER.logger.log("info", "Private key exists ")
    }
}
module.exports = {
    generatePrivateKey: generatePrivateKey
}
