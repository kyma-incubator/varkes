#!/usr/bin/env node
'use strict'

const path = require("path")
const fs = require("fs")
const LOGGER = require("./logger").logger
const forge = require("node-forge")

const keysDirectory = path.resolve("keys")
const connFile = path.resolve(keysDirectory, "connection.json")
const crtFile = path.resolve(keysDirectory, "kyma.crt")
const privateKeyFile = path.resolve(keysDirectory, "app.key")
const csrFile = path.resolve(keysDirectory, "kyma.csr")

// global connection state
var connection

module.exports = {
    init: init,
    establish: establish,
    isEstablished: isEstablished,
    destroy: destroy,
    info: info,
    privateKey: privateKey
}

function init() {
    if (!fs.existsSync(keysDirectory)) {
        fs.mkdirSync(keysDirectory)
    }

    if (fs.existsSync(privateKeyFile)) {
        LOGGER.info("Found existing private key: %s", privateKeyFile)
    } else {
        generatePrivateKey(privateKeyFile)
    }

    if (fs.existsSync(connFile)) {
        connection = JSON.parse(fs.readFileSync(connFile))
        LOGGER.info("Found existing connection info: %s", connFile)
    }
}

function establish(connData, crtData) {
    connection = connData
    connection.certificate = crtFile
    fs.writeFileSync(connFile, JSON.stringify(connection, null, 2), "utf8")
    fs.writeFileSync(crtFile, crtData, "utf8")
    LOGGER.debug("Wrote connection file to '%s' using value '%s'", connFile, JSON.stringify(connection, null, 2))

}

function isEstablished() {
    return connection && connection.metadataUrl
}

function info() {
    return connection
}

function destroy() {
    connection = null

    if (fs.existsSync(connFile)) {
        fs.unlinkSync(connFile)
    }
    if (fs.existsSync(crtFile)) {
        fs.unlinkSync(crtFile)
    }
    if (fs.existsSync(csrFile)) {
        fs.unlinkSync(csrFile)
    }
}

function privateKey() {
    return privateKeyFile
}

function generatePrivateKey(filePath) {
    LOGGER.debug("Generating new private key: %s", filePath)
    var keys = forge.pki.rsa.generateKeyPair(2048);
    const privateKey = forge.pki.privateKeyToPem(keys.privateKey)
    fs.writeFileSync(filePath, privateKey)
    LOGGER.info("Generated new private key: %s", filePath)
}