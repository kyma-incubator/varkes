const OAUTH = "/authorizationserver/oauth/token";
const METADATA = "/metadata";
import path = require("path");
import fs = require("fs");
export function resolve(configJson: any) {
    let error_message = ""
    if (configJson.hasOwnProperty("apis")) {
        for (let i = 1; i <= configJson.apis.length; i++) {

            let api = configJson.apis[i - 1];
            if (!api.name) {
                error_message += "\napi number " + i + ": missing attribute 'name', a name is mandatory";

            }
            if (!api.type || api.type == "openapi") { //empty type means openapi
                api.type = "openapi"
                api.oauth = api.oauth ? api.oauth : OAUTH
                api.metadata = api.metadata ? api.metadata : METADATA
                error_message += _openapiConfigValidation(api)
            }
            else if (api.type == "odata") {
                error_message += _odataConfigValidation(api)
            }
            else {
                error_message += "\napi '" + api.name + "': type '" + api.type + "' is not matching the pattern '^(openapi|odata)$'";
            }
        }
    }
    if (error_message != "") {
        throw new Error("Validation of configuration failed: " + error_message);
    }
}
export function generate(specs: any) {
    throw new Error("Method not implemented.");
}

export function discover(LOGGER: any, varkesConfigPath: string, currentPath: string): any {
    let varkesConfig
    if (varkesConfigPath) {
        let endpointConfig = path.resolve(currentPath, varkesConfigPath)
        LOGGER.info("Using configuration %s", endpointConfig)
        varkesConfig = JSON.parse(fs.readFileSync(endpointConfig, "utf-8"))
        varkesConfig.apis.map((api: any) => {
            api.specification = path.resolve(path.dirname(endpointConfig), api.specification)
            if (api.added_endpoints) {
                api.added_endpoints.map((ae: any) => {
                    ae.filePath = path.resolve(path.dirname(endpointConfig), ae.filePath)
                })
            }
        })
        resolve(varkesConfig)
    } else {
        LOGGER.info("Using default configuration")
        varkesConfig = JSON.parse(fs.readFileSync(__dirname + "/resources/varkes_config_default.json", "utf-8"))
    }
    return varkesConfig
}
function _odataConfigValidation(api: any): String {

    let error_message = ""

    if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\w]+$'";
    }
    if (!api.specification.match(/^.+\.xml$/)) {
        error_message += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.json$'";
    }
    if (!api.basepath) {
        error_message += "\napi '" + api.name + "': missing attribute 'basepath', a basepath is mandatory";
    }
    else if (!api.basepath.match(/^\/([/\\\w\.]+\/)*odata(\/[/\\\w\.]+)*$/)) {
        error_message += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\/([/\\\w\.]+\/)*odata(\/[/\\\w\.]+)*$'";
    }
    return error_message
}


function _openapiConfigValidation(api: any): String {
    let error_message = "";

    if (api.metadata && !api.metadata.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi '" + api.name + "': metadata '" + api.metadata + "' is not matching the pattern '^\\/[/\\\\\w]+$+'";
    }
    if (!api.oauth.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi '" + api.name + "': oauth '" + api.oauth + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
    }
    if (!api.specification.match(/^.+\.(json|yaml|yml)$/)) {
        error_message += "\napi '" + api.name + "': specification '" + api.specification + "' does not match pattern '^.+\\.(json|yaml|yml)$'";
    }
    if (!api.basepath) {
        error_message += "\napi '" + api.name + "': missing attribute 'basepath', a basepath is mandatory";
    }
    else if (!api.basepath.match(/^\/[/\\\w]+$/)) {
        error_message += "\napi '" + api.name + "': basepath '" + api.basepath + "' is not matching the pattern '^\\/[/\\\\\w]+$'";
    }
    return error_message
}


