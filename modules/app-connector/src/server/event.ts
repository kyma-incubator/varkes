import { logger as LOGGER } from "./logger";
import * as request from 'request-promise';
import * as connection from './connection';
import * as common from './common';

export class Event {
    public sendEvent(metaData: any) {
        return common.assureConnected(connection).then(() => {
            return request(common.createRequestOptions(connection, {
                uri: connection.info().eventsUrl,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: metaData
            })).then((response: any) => {
                if (response.statusCode < 300) {
                    LOGGER.debug("Received send confirmation: %s", JSON.stringify(response.body, ["id","name"], 2))
                    return response.body;
                } else {
                    throw common.resolveError(response.statusCode, response.body, "sending event")
                }
            })
        })
    }
}