var apis = require("../../server/api");
var CONFIG = require("../../config")
const fs = require("fs")
const path = require("path")

CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))

serviceJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../kyma-responses/ec-events.json")))
console.log(serviceJSON)
apis.createAPI(false, serviceJSON, (data, err) => console.log(data))


function defineServiceMetadata() {
    return {
        "provider": "aY",
        "name": "ec-mock-service-4",
        "description": "testing... 1.2.3.",
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
        },

        "documentation": {
            "displayName": "string",
            "description": "string",
            "type": "string",
            "tags": [
                "string"
            ],
            "docs": [
                {
                    "title": "string",
                    "type": "string",
                    "source": "string"
                }
            ]
        }
    }
}