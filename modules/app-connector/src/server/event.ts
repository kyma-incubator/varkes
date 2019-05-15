import { logger as LOGGER } from "./logger";
import * as request from 'request-promise';
import * as connection from './connection';

export class Event {

    public sendEvent(metaData: any) {
        return new Promise((resolve, reject) => {
            request.post({
                url: connection.info().eventsUrl,
                headers: {
                    "Content-Type": "application/json"
                },
                json: metaData,
                agentOptions: {
                    cert: connection.certificate(),
                    key: connection.privateKey()
                },
                rejectUnauthorized: !connection.info().insecure
            }, (error: any, httpResponse: any, body: any) => {
                if (error) {
                    LOGGER.error("Error while Sending Event: %s", error)
                    let resultobj = {
                        statusCode: 500,
                        message: error
                    }
                    reject(resultobj);
                } else {
                    let resultObj = { statusCode: httpResponse.statusCode, message: {} };
                    if (httpResponse.statusCode >= 400) {
                        let message = "Error while Sending Event: %s" + JSON.stringify(body, null, 2);
                        LOGGER.error(message);
                        resultObj.message = new Error(message)
                        reject(resultObj);
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