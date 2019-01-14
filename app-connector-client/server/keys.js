const fs = require("fs")
var CONFIG = require("./config")
const path = require("path")
var LOGGER = require("./logger").logger
var forge = require("node-forge")

var keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)

//Generate Key if not exists
exports.generatePrivateKey = function generatePrivateKey() {
    if (!fs.existsSync(path.resolve(CONFIG.keyDir))) {
        fs.mkdirSync(path.resolve(CONFIG.keyDir))
    }

    if (!fs.existsSync(keyFile)) {
        LOGGER.info("Generating new key file: %s", keyFile)
        var keys = forge.pki.rsa.generateKeyPair(4096);
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
        fs.writeFileSync(keyFile, privateKey)
        LOGGER.info("Generated new key file: %s", keyFile)
    } else {
        LOGGER.info("Found existing key file: %s", keyFile)
    }
}
