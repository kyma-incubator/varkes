import { LOGGER } from "../app"
import * as express from "express"
import * as services from "../services";
import { api, connection } from "@varkes/app-connector"

var varkesConfig: any;
function getAll(req: any, res: any) {
    LOGGER.debug("Getting all Local APIs")
    let apis = []
    let configApis = varkesConfig.apis;
    for (let i = 0; i < configApis.length; i++) {
        let api = configApis[i]
        let metadata: any = services.fillServiceMetadata(api, getOrigin(req))
        metadata.id = api.name
        apis.push(metadata)
    }
    let configEvents = varkesConfig.events;
    for (let i = 0; i < configEvents.length; i++) {
        let event = configEvents[i];
        let metadata: any = services.fillEventData(event)
        metadata.id = event.name;
        apis.push(metadata);
    }
    res.status(200).send(apis);
}
function getLocalApi(req: any, res: any) {
    LOGGER.debug("Getting Local API")
    let apiname = req.params.apiname;
    let api = varkesConfig.apis.find((x: any) => x.name == apiname);
    if (api) {
        let serviceMetadata: any = services.fillServiceMetadata(api, getOrigin(req))
        serviceMetadata.id = apiname;
        res.status(200).send(serviceMetadata);
    }
    else {
        api = varkesConfig.events.find((x: any) => x.name == apiname);
        if (api) {
            let eventMetadata: any = services.fillEventData(api)
            eventMetadata.id = apiname;
            res.status(200).send(eventMetadata);
        }
        else {
            let message = "api " + apiname + " does not exist";
            LOGGER.error(message);
            res.status(404).send({ error: message })
        }
    }
}
function getOrigin(req: any) {
    if (req.body.baseUrl && !req.body.baseUrl.match(/http(s)?:\/\//)) {
        return req.protocol + req.body.baseUrl
    }
    return req.body.baseUrl || req.protocol + "://" + req.headers.host
}

async function registerAll(req: any, res: any) {
    LOGGER.debug("Registering all Local APIs")
    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    }
    try {
        let registeredAPIs = await api.findAll();
        services.createServicesFromConfig(getOrigin(req), varkesConfig, registeredAPIs)
        LOGGER.debug("Auto-registering %d APIs and %d Event APIs", varkesConfig.apis ? varkesConfig.apis.length : 0, varkesConfig.events ? varkesConfig.events.length : 0)
        res.status(200).send(connection.info())
    }
    catch (error) {
        LOGGER.error("Failed to register all APIs: %s")
        res.status(500).send({ error: error.message })
    }
}
function getStatus(req: any, res: any) {
    LOGGER.debug("Getting Registration Status")
    res.status(200).send(services.getStatus());
}
async function register(req: any, res: any) {
    LOGGER.debug("Register Local API %s", req.params.apiname)

    let err = assureConnected()
    if (err) {
        res.status(400).send({ error: err })
    } else {
        let apiName = req.params.apiname;
        let apis = varkesConfig.apis;
        let events = varkesConfig.events;
        let apiFound = false;
        let serviceMetadata: any;
        for (let i = 0; i < apis.length; i++) {
            let apiEntry = apis[i];
            if (apiEntry.name == apiName) {
                serviceMetadata = services.fillServiceMetadata(apiEntry, getOrigin(req));
                apiFound = true;
                break;
            }
        }
        for (let i = 0; i < events.length && !apiFound; i++) {
            let event = events[i];
            if (event.name == apiName) {
                serviceMetadata = services.fillEventData(event);
                break;
            }
        }
        try {
            let registeredAPIs = await api.findAll();
            let reg_api;
            if (registeredAPIs.length > 0)
                reg_api = registeredAPIs.find((x: any) => x.name == serviceMetadata.name)
            if (!reg_api) {
                let result = await api.create(serviceMetadata)
                res.status(200).send(result);
            } else {
                let result = await api.update(serviceMetadata, reg_api.id)
                res.status(200).send(result);
            }
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
}
function assureConnected() {
    if (!connection.established()) {
        return "Not connected to a kyma cluster, please re-connect"
    }
    return null
}
function router(config: any) {
    let apiRouter = express.Router()
    varkesConfig = config
    apiRouter.get("/apis", getAll)
    apiRouter.post("/registration", registerAll)
    apiRouter.get("/registration", getStatus)
    apiRouter.get("/apis/:apiname", getLocalApi)
    apiRouter.post("/apis/:apiname/register", register)
    return apiRouter
}

export { router }