import { existsSync, mkdirSync, writeFileSync } from "fs"


import { CONFIG } from "./config"

import { resolve } from "path"
import { LOGGER } from "./logger"

import { pki } from "node-forge"

var keyFile = resolve(CONFIG.keyDir, CONFIG.keyFile)

//Generate Key if not exists
exports.generatePrivateKey = function generatePrivateKey() {
    if (!existsSync(resolve(CONFIG.keyDir))) {
        mkdirSync(resolve(CONFIG.keyDir))
    }

    if (!existsSync(keyFile)) {
        LOGGER.info("Generating new key file: %s", keyFile)
        var keys = pki.rsa.generateKeyPair(2048);
        const privateKey = pki.privateKeyToPem(keys.privateKey)
        writeFileSync(keyFile, privateKey)
        LOGGER.info("Generated new key file: %s", keyFile)
    } else {
        LOGGER.info("Found existing key file: %s", keyFile)
    }
}
