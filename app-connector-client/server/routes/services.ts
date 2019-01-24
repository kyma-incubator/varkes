
import { LOGGER } from "../logger"

import * as yaml from "js-yaml"
import * as fs from "fs"
import { createAPI } from "./apis"
let odata: any;


async function createServicesFromConfig(localKyma: boolean, hostname: string, apisConfig: any) {
    if (!apisConfig)
        return

    let serviceMetadata = defineServiceMetadata()
    for (let i = 0; i < apisConfig.length; i++) {
        let api = apisConfig[i]
        try {
            await createService(localKyma, serviceMetadata, api, hostname)
            LOGGER.debug("Registered API successful: %s", api.name)
        } catch (error) {
            LOGGER.error("Registration of API '%s' failed: %s", api.name, error)
        }
    }
}
function createService(localKyma: boolean, serviceMetadata: any, api: any, hostname: string) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata.name = api.name;
        serviceMetadata.api.targetUrl = hostname;
        if (api.baseurl)
            serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

        serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + api.oauth;
        if (!odata) {
            var doc = yaml.safeLoad(fs.readFileSync(api.specification_file, 'utf8'));
            serviceMetadata.api.spec = doc;
            if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("description")) {
                serviceMetadata.description = doc.info.description;
            }
            else if (doc.hasOwnProperty("info") && doc.info.hasOwnProperty("title")) {
                serviceMetadata.description = doc.info.title;
            }
            else {
                serviceMetadata.description = api.name;
            }
        }
        else {
            serviceMetadata.description = api.name;
            serviceMetadata.api.specificationUrl = api.metadata;
            serviceMetadata.api.apiType = "odata";
        }

        createAPI(localKyma, serviceMetadata, function (data: any, err: any) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}





function defineServiceMetadata() {
    return {
        "provider": "SAP Hybris",
        "name": "ec-mock-service-4",
        "description": "",
        "api": {
            "targetUrl": "http://localhost/target",
            "credentials": {
                "oauth": {
                    "url": "http://localhost/oauth/validate",
                    "clientId": "string",
                    "clientSecret": "string"
                }
            },
            "spec": {}
        }
    }
}

export { createServicesFromConfig }
