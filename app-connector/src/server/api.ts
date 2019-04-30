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
    public async findAll() {
        let err = this.assureConnected()
        if (err) {
            throw new Error(err);
        }
        request({
            url: connection.info().metadataUrl,
            method: "GET",
            agentOptions: {
                cert: connection.certificate(),
                key: connection.privateKey()
            },
            rejectUnauthorized: connection.info().insecure
        }, (error: any, httpResponse: any, body: any) => {
            if (error) {
                LOGGER.error("Error while Sending Event: %s", error)
                throw error;
            } else {
                if (httpResponse.statusCode >= 400) {
                    let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                    LOGGER.error(message);
                    throw new Error(message);
                }
                else {
                    LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                    return body;
                }
            }
        })

    }

    public async create(serviceMetadata: any) {
        let err = this.assureConnected()
        if (err) {
            throw new Error(err);
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
            rejectUnauthorized: connection.info().insecure
        }, (error: any, httpResponse: any, body: any) => {
            if (error) {
                LOGGER.error("Error while Sending Event: %s", error)
                throw error;
            } else {
                if (httpResponse.statusCode >= 400) {
                    let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                    LOGGER.error(message);
                    throw new Error(message);
                }
                else {
                    LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                    return body;
                }
            }
        })
    }

    public async update(serviceMetadata: any, api_id: any) {
        let err = this.assureConnected()
        if (err) {
            throw new Error(err);
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
            rejectUnauthorized: connection.info().insecure
        }, (error: any, httpResponse: any, body: any) => {
            if (error) {
                LOGGER.error("Error while Sending Event: %s", error)
                throw error;
            } else {
                if (httpResponse.statusCode >= 400) {
                    let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                    LOGGER.error(message);
                    throw new Error(message);
                }
                else {
                    LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                    return body;
                }
            }
        })
    }
    public async findOne(apiId: any) {
        let err = this.assureConnected()
        if (err) {
            throw new Error(err);
        }
        request.get({
            url: `${connection.info().metadataUrl}/${apiId}`,
            agentOptions: {
                cert: connection.certificate(),
                key: connection.privateKey()
            },
            rejectUnauthorized: connection.info().insecure
        }, (error: any, httpResponse: any, body: any) => {
            if (error) {
                LOGGER.error("Error while Sending Event: %s", error)
                throw error;
            } else {
                if (httpResponse.statusCode >= 400) {
                    let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                    LOGGER.error(message);
                    throw new Error(message);
                }
                else {
                    LOGGER.debug("Received event response: %s", JSON.stringify(body, null, 2))
                    return body;
                }
            }
        })
    }
}