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
                    LOGGER.error("Error while Sending Event: %s", error)
                    reject(error);
                } else {
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        reject(new Error(message));
                    }
                    else {
                        LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                        resolve(body);
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
                    LOGGER.error("Error while Sending Event: %s", error)
                    reject(error);
                } else {
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        reject(new Error(message));
                    }
                    else {
                        LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                        resolve(body);
                    }
                }
            })
        })
    }

    public async update(serviceMetadata: any, api_id: any) {
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
                    LOGGER.error("Error while Sending Event: %s", error)
                    reject(error);
                } else {
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        reject(new Error(message));
                    }
                    else {
                        LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                        resolve(body);
                    }
                }
            })
        })
    }
    public async findOne(apiId: any) {
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
                    LOGGER.error("Error while Sending Event: %s", error)
                    reject(error);
                } else {
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        reject(new Error(message));
                    }
                    else {
                        LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                        resolve(body);
                    }
                }
            })
        })
    }
}