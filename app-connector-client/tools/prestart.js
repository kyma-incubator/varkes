const fs = require("fs")
var CONFIG = require("../server/config")
const path = require("path")
var LOGGER = require("../server/logger")
var forge = require("node-forge")

var keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)

if (!fs.existsSync(path.resolve(CONFIG.keyDir))) {
    fs.mkdirSync(path.resolve(CONFIG.keyDir))
}

if (require.main === module) {
    generatePrivateKey()
}


//Generate Key if not exists
function generatePrivateKey() {
    if (!fs.existsSync(keyFile)) {
        var keys = forge.pki.rsa.generateKeyPair(4096);
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
        fs.writeFileSync(keyFile, privateKey)
        LOGGER.logger.info("Generated new key file: %s", keyFile)
    } else {
        LOGGER.logger.info("Found existing key file: %s", keyFile)
    }
}

module.exports = {
    generatePrivateKey: generatePrivateKey
}
