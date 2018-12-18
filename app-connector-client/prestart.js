const fs = require("fs")
var CONFIG = require("./config")
const path = require("path")
var LOGGER = require("./server/logger")
var forge = require("node-forge")
keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
console.log(keyFile)
!fs.existsSync(path.resolve(CONFIG.keyDir)) ? fs.mkdirSync(path.resolve(CONFIG.keyDir)) : {}


if (require.main === module) {
    generatePrivateKey()
}


//Generate Key if not exists
function generatePrivateKey() {

    if (!fs.existsSync(path.resolve(CONFIG.keyDir, "ec-default.key"))) {
        var keys = forge.pki.rsa.generateKeyPair(4096);
        const privateKey =
            forge.pki.privateKeyToPem(keys.privateKey)


        fs.writeFileSync(keyFile, privateKey)
    } else {
        LOGGER.logger.log("info", "Private key exists ")
    }
}
module.exports = {
    generatePrivateKey: generatePrivateKey
}
