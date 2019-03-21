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

// global connection state, not thread-safe for now
var connection
var privateKeyData
var certificateData

module.exports = {
    init: init,
    establish: establish,
    established: established,
    destroy: destroy,
    info: info,
    privateKey: privateKey,
    certificate: certificate,
    secure: secure
}

function init() {
    if (!fs.existsSync(keysDirectory)) {
        fs.mkdirSync(keysDirectory)
    }

    if (fs.existsSync(privateKeyFile)) {
        privateKeyData = fs.readFileSync(privateKeyFile, "utf-8")
        LOGGER.info("Found existing private key: %s", privateKeyFile)
    } else {
        privateKeyData = generatePrivateKey(privateKeyFile)
    }
    

    if (fs.existsSync(connFile)) {
        connection = JSON.parse(fs.readFileSync(connFile))
        LOGGER.info("Found existing connection info: %s", connFile)
    }

    if (fs.existsSync(crtFile)) {
        certificateData = fs.readFileSync(crtFile, "utf-8")
        LOGGER.info("Found existing certificate: %s", crtFile)
    }
}

function establish(connData, crtData) {
    connection = connData
    certificateData = crtData
    fs.writeFileSync(connFile, JSON.stringify(connection, null, 2), "utf8")
    fs.writeFileSync(crtFile, crtData, "utf8")
    LOGGER.debug("Wrote connection file to '%s' using value '%s'", connFile, JSON.stringify(connection, null, 2))
}

function established() {
    return connection && connection.metadataUrl
}

function info() {
    assureEstablished()
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
}

function certificate() {
    assureEstablished()
    return certificateData
}

function privateKey() {
    return privateKeyData
}

function secure() {
    assureEstablished()
    return !connection.insecure
}

function generatePrivateKey(filePath) {
    LOGGER.debug("Generating new private key: %s", filePath)
    var keys = forge.pki.rsa.generateKeyPair(2048)
    const key = forge.pki.privateKeyToPem(keys.privateKey)
    fs.writeFileSync(filePath, key)
    LOGGER.info("Generated new private key: %s", filePath)
    return key
}

function assureEstablished() {
    if (!established()) {
        throw new Error("Trying to access connection status without having a connection established. Please call connection.established() upfront to assure an available connection status")
    }
}