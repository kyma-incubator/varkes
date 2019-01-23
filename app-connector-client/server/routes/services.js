
var LOGGER = require("../logger").logger
const yaml = require('js-yaml');
const fs = require("fs")
const apis = require("./apis");
async function createServicesFromConfig(localKyma, hostname, apisConfig) {
    if (!apisConfig)
        return

    serviceMetadata = defineServiceMetadata()
    for (i = 0; i < apisConfig.length; i++) {
        api = apisConfig[i]
        try {
            await createService(localKyma, serviceMetadata, api, hostname)
            LOGGER.debug("Registered API successful: %s", api.name)
        } catch (error) {
            LOGGER.error("Registration of API '%s' failed: %s", api.name, error)
        }
    }
}
function createService(localKyma, serviceMetadata, api, hostname) {
    LOGGER.debug("Auto-register API '%s'", api.name)
    return new Promise((resolve, reject) => {
        serviceMetadata.name = api.name;
        serviceMetadata.api.targetUrl = hostname;
        if (api.baseurl)
            serviceMetadata.api.targetUrl = serviceMetadata.api.targetUrl + api.baseurl;

        serviceMetadata.api.credentials.oauth.url = serviceMetadata.api.targetUrl + api.oauth;
        if (!api.type || api.type != "odata") {
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

module.exports = {
    createServicesFromConfig: createServicesFromConfig
}