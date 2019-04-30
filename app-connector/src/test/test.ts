import { api, event, connection } from '../server/app';
import * as request from "supertest"
import * as express from "express"
import * as kyma from "@varkes/example-kyma-mock";
import * as fs from 'fs';
import { AssertionError, equal } from 'assert';
const port = 10001 //! listen in different port
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`
describe("should work", () => {
    var kymaServer: any
    var server: any
    before(async () => { //* start kyma mock before tests
        deleteKeysFile()
        await kyma.then((app: any) => {
            kymaServer = app.listen(port)
        })

        let connectionData = await connection.connect(tokenURL)
        return equal(connectionData, { "ss": "dd" });
    })

    after(() => { //* stop kyma mock after tests
        kymaServer.close(() => {
            deleteKeysFile()
        })
    })
});

function deleteKeysFile() {
    const path = "./keys"
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            fs.unlinkSync(path + "/" + file)
        })
        fs.rmdirSync(path)
    }
}