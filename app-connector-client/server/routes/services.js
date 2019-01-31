
var LOGGER = require("../logger").logger
const yaml = require('js-yaml');
const fs = require("fs")
const apis = require("./apis");

const OAUTH = "/authorizationserver/oauth/token"

async function createServicesFromConfig(localKyma, hostname, apisConfig, registeredApis) {
    if (!apisConfig)
        return

    serviceMetadata = defineServiceMetadata()
    for (i = 0; i < apisConfig.length; i++) {
        api = apisConfig[i]
        try {
            var reg_api;
            if (registeredApis.length > 0)
                reg_api = registeredApis.find(x => x.name == api.name);
            if (!reg_api) {
                await createService(localKyma, serviceMetadata, api, hostname)
                LOGGER.debug("Registered API successful: %s", api.name)
            }
            else {
                await updateService(localKyma, serviceMetadata, api, reg_api.id, hostname);
                LOGGER.debug("Updated API successful: %s", api.name)
            }
        } catch (error) {
            LOGGER.error("Registration of API '%s' failed: %s", api.name, error)
        }
    }
    return registeredApis;
}
function createService(localKyma, serviceMetadata, api, hostname) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata = fillServiceMetadata(serviceMetadata, api, hostname);
        apis.createAPI(localKyma, serviceMetadata, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        });
    })
}
function updateService(localKyma, serviceMetadata, api, api_id, hostname) {
    LOGGER.debug("Auto-update API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata = fillServiceMetadata(serviceMetadata, api, hostname);
        apis.updateAPI(localKyma, serviceMetadata, api_id, function (err, httpResponse, body) {
            if (err) {
                reject(err)
            } else {
                if (httpResponse.statusCode >= 400) {
                    var err = new Error(body.error);
                    reject(err);
                }
                resolve(body)
            }
        });
    })
}
function getAllAPI(localKyma) {
    LOGGER.debug("Get all API ")
    return new Promise((resolve, reject) => {
        apis.getAllAPIs(localKyma, function (error, httpResponse, body) {
            if (error) {
                reject(error);
            } else if (httpResponse.statusCode >= 400) {
                var err = new Error(body.error);
                reject(err);
            } else {
                resolve(JSON.parse(body))
            }
        })
    })
}
function fillServiceMetadata(serviceMetadata, api, hostname) {
    serviceMetadata.name = api.name;
    serviceMetadata.api.targetUrl = hostname;
    if (api.baseurl)
        serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

    serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + (api.oauth ? api.oauth : OAUTH);
    if (!api.type || api.type != "odata") {
        var doc = yaml.safeLoad(fs.readFileSync(api.specification, 'utf8'));
        serviceMetadata.api.specificationUrl = api.metadata;
        //serviceMetadata.api.spec = doc;
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
    return serviceMetadata;
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

module.exports = {
    createServicesFromConfig: createServicesFromConfig,
    getAllAPI: getAllAPI
}