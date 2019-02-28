#!/usr/bin/env node
'use strict'

const fs = require("fs")
const CONFIG = require("./config.json")
const path = require("path")
const LOGGER = require("./logger").logger
const forge = require("node-forge")

//Generate Key if not exists
exports.generatePrivateKey = function generatePrivateKey() {
    if (!fs.existsSync(path.resolve(CONFIG.keyDir))) {
        fs.mkdirSync(path.resolve(CONFIG.keyDir))
    }

    var keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
    if (!fs.existsSync(keyFile)) {
        LOGGER.info("Generating new key file: %s", keyFile)
        var keys = forge.pki.rsa.generateKeyPair(2048);
        const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
        fs.writeFileSync(keyFile, privateKey)
        LOGGER.info("Generated new key file: %s", keyFile)
    } else {
        LOGGER.info("Found existing key file: %s", keyFile)
    }
}
