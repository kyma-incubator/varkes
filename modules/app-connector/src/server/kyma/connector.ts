#!/usr/bin / env node
'use strict'

import * as connection from '../connection';
import * as common from './common';
import * as commonCommon from '../common';
import * as config from "@varkes/configuration"
import * as request from "request-promise";
import * as url from 'url';

const forge = require("node-forge");
const LOGGER: any = config.logger("app-connector")

async function callTokenUrl(insecure: boolean, url: string) {
    LOGGER.debug("Calling token URL '%s'", url)
    return request({
        uri: url,
        method: "GET",
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode < 300) {
            LOGGER.debug("Token URL returned %s", JSON.stringify(response.body, null, 2))
            return response.body
        } else if (response.statusCode == 403) {
            LOGGER.debug("Token URL returned failed with status 403: %s", JSON.stringify(response.body, null, 2))
            throw new Error("The token is invalid, please fetch a new token")
        } else {
            throw new Error("Calling token URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
    })
}

async function callCSRUrl(csrUrl: string, csr: any, insecure: boolean) {
    LOGGER.debug("Calling csr URL '%s'", csrUrl)
    let csrData = forge.util.encode64(csr)

    return request.post({
        uri: csrUrl,
        body: { csr: csrData },
        json: true,
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode !== 201) {
            throw new Error("Calling CSR URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("CSR returned")
        return Buffer.from(response.body.crt, 'base64').toString("ascii")
    })
}

async function callInfoUrl(infoUrl: string, crt: any, privateKey: string, insecure: boolean) {
    LOGGER.debug("Calling info URL '%s'", infoUrl)

    return request.get({
        uri: infoUrl,
        json: true,
        agentOptions: {
            cert: crt,
            key: privateKey
        },
        rejectUnauthorized: !insecure,
        resolveWithFullResponse: true,
        simple: false
    }).then((response: any) => {
        if (response.statusCode !== 200) {
            throw new Error("Calling Info URL failed with status '" + response.statusCode + "' and body '" + JSON.stringify(response.body, null, 2) + "'")
        }
        LOGGER.debug("Got following Info URL returned: %s", JSON.stringify(response.body, null, 2))
        return response.body
    })
}

export async function connect(tokenUrl: string, insecure: boolean = false): Promise<any> {
    let tokenResponse = await callTokenUrl(insecure, tokenUrl)
    let csr = commonCommon.generateCSR(tokenResponse.certificate.subject, connection.privateKey())
    let certificateData = await callCSRUrl(tokenResponse.csrUrl, csr, insecure)
    let infoResponse = await callInfoUrl(tokenResponse.api.infoUrl, certificateData, connection.privateKey(), insecure)

    let domains = new url.URL(infoResponse.urls.metadataUrl).hostname.replace("gateway.", "");
    let connectionData: connection.Info = {
        insecure: insecure,
        metadataUrl: infoResponse.urls.metadataUrl,
        eventsUrl: infoResponse.urls.eventsUrl,
        renewCertUrl: infoResponse.urls.renewCertUrl,
        revocationCertUrl: infoResponse.urls.revocationCertUrl,
        consoleUrl: infoResponse.urls.metadataUrl.replace("gateway", "console").replace(infoResponse.clientIdentity.application + "/v1/metadata/services", ""),
        applicationUrl: infoResponse.urls.metadataUrl.replace("gateway", "console").replace(infoResponse.clientIdentity.application + "/v1/metadata/services", "home/cmf-apps/details/" + infoResponse.clientIdentity.application),
        domain: domains,
        application: infoResponse.clientIdentity.application,
        type: connection.Type.Kyma
    }

    return { connection: connectionData, certificate: certificateData };
}
