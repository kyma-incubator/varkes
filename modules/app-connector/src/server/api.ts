import { logger as LOGGER } from "./logger";
import * as request from 'request-promise';
import * as connection from './connection';
import * as common from './common';

export class API {
    public findAll(): Promise<any> {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: connection.info().metadataUrl,
                method: "GET"
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received all APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
                    return response.body;
                } else {
                    throw common.resolveError(response.statusCode, response.body, "getting all APIs")
                }
            })
        })
    }

    public create(serviceMetadata: any) {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: connection.info().metadataUrl,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: serviceMetadata
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received creation confirmation: %s", JSON.stringify(response.body, ["id", "name"], 2))
                    return response.body;
                } else {
                    throw common.resolveError(response.statusCode, response.body, "creating API")
                }
            })
        })
    }

    public update(serviceMetadata: any, api_id: any) {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: `${connection.info().metadataUrl}/${api_id}`,
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: serviceMetadata
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received updated APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
                    return response.body;
                } else if (response.statusCode == 404) {
                    return null
                } else {
                    throw common.resolveError(response.statusCode, response.body, "updating API")
                }
            })
        })
    }

    public findOne(apiId: string) {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: `${connection.info().metadataUrl}/${apiId}`,
                method: "GET"
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received APIs: %s", JSON.stringify(response.body, ["id", "name"], 2))
                    return response.body;
                } else if (response.statusCode == 404) {
                    return null
                } else {
                    throw common.resolveError(response.statusCode, response.body, "getting API")
                }
            })
        })
    }

    public delete(apiId: string) {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: `${connection.info().metadataUrl}/${apiId}`,
                method: "DELETE"
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received deletion confirmation")
                    return apiId;
                } else if (response.statusCode == 404) {
                    return null
                } else {
                    throw common.resolveError(response.statusCode, response.body, "deleting API")
                }
            })
        })
    }
}