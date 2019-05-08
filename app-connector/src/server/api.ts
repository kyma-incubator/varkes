import { logger as LOGGER } from "./logger";
import * as request from 'request-promise';
import * as connection from './connection';

export class API {
    private assureConnected() {
        if (!connection.established()) {
            return "Not connected to a kyma cluster, please re-connect"
        }
        return null
    }
    public findAll() {
        return new Promise((resolve, reject) => {
            let err = this.assureConnected()
            if (err) {
                reject(new Error(err));
            }
            request({
                url: connection.info().metadataUrl,
                method: "GET",
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Finding all APIs: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        body: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, body: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Finding all APIs: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.body = new Error(message)
                        reject(resultObj);
                    }
                    else {
                        LOGGER.debug("Received all APIs: %s", JSON.stringify(body, null, 2))
                        resultObj.body = JSON.parse(body);
                        resolve(resultObj);
                    }
                }
            })
        })


    }

    public create(serviceMetadata: any) {
        return new Promise((resolve, reject) => {
            let err = this.assureConnected()
            if (err) {
                reject(new Error(err));
            }
            request.post({
                url: connection.info().metadataUrl,
                headers: {
                    "Content-Type": "application/json"
                },
                json: serviceMetadata,
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Creating Api: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        body: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, body: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Creating Api: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.body = new Error(message)
                        reject(resultObj);
                    }
                    else {
                        LOGGER.debug("Received new Api: %s", JSON.stringify(body, null, 2))
                        resultObj.body = body;
                        resolve(resultObj);
                    }
                }
            })
        })
    }

    public update(serviceMetadata: any, api_id: any) {
        return new Promise((resolve, reject) => {
            let err = this.assureConnected()
            if (err) {
                reject(new Error(err));
            }
            request.put({
                url: `${connection.info().metadataUrl}/${api_id}`,
                headers: {
                    "Content-Type": "application/json"
                },
                json: serviceMetadata,
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Updating Api: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        body: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, body: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Updating Api: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.body = new Error(message)
                        reject(resultObj);
                    }
                    else {
                        LOGGER.debug("Received Updated Api: %s", JSON.stringify(body, null, 2))
                        resultObj.body = body;
                        resolve(resultObj);
                    }
                }
            })
        })
    }
    public findOne(apiId: any) {
        return new Promise((resolve, reject) => {
            let err = this.assureConnected()
            if (err) {
                reject(new Error(err));
            }
            request.get({
                url: `${connection.info().metadataUrl}/${apiId}`,
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Finding Api: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        body: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, body: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Finding Api: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.body = new Error(message)
                        reject(resultObj);
                    }
                    else {
                        LOGGER.debug("Received Found Api: %s", JSON.stringify(body, null, 2))
                        resultObj.body = JSON.parse(body);
                        resolve(resultObj);
                    }
                }
            })
        })
    }

    public delete(apiId: any) {
        LOGGER.debug("Delete API %s", apiId)
        return new Promise((resolve, reject) => {
            let err = this.assureConnected()
            if (err) {
                reject(new Error(err));
            }
            request.delete({
                url: `${connection.info().metadataUrl}/${apiId}`,
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Deleting Api: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        body: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, body: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Deleting Api: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.body = new Error(message)
                        reject(resultObj);
                    }
                    else {
                        LOGGER.debug("Received Deleted confirmation: %s", JSON.stringify(body, null, 2))
                        resultObj.body = body;
                        resolve(resultObj);
                    }
                }
            })
        })
    }
}