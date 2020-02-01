#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"

const forge = require("node-forge");
const LOGGER: any = config.logger("app-connector")

export function assureConnected(connection: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!connection.established()) {
            reject(new Error("Not connected to a kyma cluster, please re-connect"));
        }
        resolve(true)
    })
}

export function generateCSR(subject: any, privateKey: Buffer):Buffer {
    LOGGER.debug("Creating CSR using subject %s", subject)
    let pk = forge.pki.privateKeyFromPem(privateKey.toString())
    let publickey = forge.pki.setRsaPublicKey(pk.n, pk.e)

    // create a certification request (CSR)
    let csr = forge.pki.createCertificationRequest()
    csr.publicKey = publickey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    LOGGER.debug("Created csr using subject %s", subject)
    return Buffer.from(forge.pki.certificationRequestToPem(csr))
}

function parseSubjectToJsonArray(subject: any) {
    let subjectsArray: any = []
    subject.split(",").map((el: any) => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray;
}