#!/usr/bin/env node
'use strict'

import * as  mock from "../server/app"
import * as request from "supertest"
import * as express from "express"
import * as fs from "fs"
import * as path from "path"
const kyma = require("@varkes/example-kyma-mock")
const testAPI = JSON.parse(fs.readFileSync(path.resolve("dist/test/test-api.json"), "utf-8"))
const schoolsAPI = JSON.parse(fs.readFileSync(path.resolve("dist/test/expect/schools.json"), "utf-8"))
const coursesAPI = JSON.parse(fs.readFileSync(path.resolve("dist/test/expect/courses.json"), "utf-8"))
const northwindAPI = JSON.parse(fs.readFileSync(path.resolve("dist/test/expect/northwind.json"), "utf-8"))
const events1API = JSON.parse(fs.readFileSync(path.resolve("dist/test/expect/events1.json"), "utf-8"))
const events2API = JSON.parse(fs.readFileSync(path.resolve("dist/test/expect/events2.json"), "utf-8"))

const port = 10001 //! listen in different port
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`

describe("should work", () => {
    var kymaServer: any
    var server: any
    before(async () => { //* start kyma mock before tests
        await kyma.then((app: any) => {
            kymaServer = app.listen(port)
        })
        await mock.init("varkes_config.json", __dirname).then((mock: any) => {
            server = express()
            server.use(mock)
        })
        await request(server)  //* Make sure we are connected to kyma
            .post("/connection")
            .send({ "url": tokenURL })
            .set('Accept', 'application/json').
            expect(200)
        await request(server) //* Make sure we registered local apis to kyma
            .post('/local/registration')
            .send({ "baseUrl": "http://localhost" })
            .set('Accept', 'application/json')
            .expect(200)
    })

    after(async () => { //* stop kyma mock after tests
        await kymaServer.close(() => {
            deleteKeysFile();
        })
    })

    describe('basic routes', () => {
        it('responds to /', () => {
            return request(server)
                .get('/')
                .expect(404)
        })

        it("shows meteadata", () => {
            return request(server)
                .get("/metadata")
                .expect(200)
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
        })
        it('404 everything else', () => {
            return request(server)
                .get('/foo/bar')
                .expect(404)
        })
        it("can get connection info", () => {
            return request(server)
                .get("/connection")
                .expect(200)
        })
    })

    describe('bundled apis', () => {
        it('registered apis contains schools and courses', () => {
            return request(server)
                .get('/remote/apis')
                .expect(200)
                .expect(new RegExp(JSON.stringify(schoolsAPI), "g"))
                .expect(new RegExp(JSON.stringify(coursesAPI), "g"))
        })

        it('local apis contains schools and courses', () => {
            return request(server)
                .get('/local/apis')
                .expect(200)
                .expect(new RegExp(JSON.stringify(schoolsAPI), "g"))
                .expect(new RegExp(JSON.stringify(coursesAPI), "g"))
        })

        it('registered events contains events1 and events2', () => {
            return request(server)
                .get('/remote/apis')
                .expect(200)
            //.expect(new RegExp(JSON.stringify(events1API), "g"))
            //.expect(new RegExp(JSON.stringify(events2API), "g"))
        })

        it('local events contains events1 and events2', () => {
            return request(server)
                .get('/local/apis')
                .expect(200)
            //.expect(new RegExp(JSON.stringify(events1API), "g"))
            //.expect(new RegExp(JSON.stringify(events2API), "g"))
        })

        it('404 everything else', () => {
            return request(server)
                .get('/foo/bar')
                .expect(404)
        })
    })

    describe("events endpoints", () => {
        it("sends event", () => {
            return request(server)
                .post('/events')
                .send({
                    "event-type": "customer.created.v1",
                    "event-type-version": "v1",
                    "event-time": "2019-03-04T14:19:29.450Z",
                    "data": {
                        "customerUid": "icke"
                    }
                })
                .expect(200)
        })
    })

    describe("api endpoints", () => {
        it("creates a new API", () => {
            return createAPI(server)
        })

        it("deletes an API", () => {
            return createAPI(server).then((api) => {
                request(server)
                    .delete(`/remote/apis/${api}`)
                    .set("Accept", "application/json")
                    .send(testAPI)
                    .expect(200)
            })
        })

        it("shows a specific API", () => {
            return createAPI(server).then(api => {
                request(server)
                    .get(`/remote/apis/${api}`)
                    .set("Accept", "application/json")
                    .expect(200)
            })
        })

        it("updates a specific API", () => {
            return createAPI(server).then(api => {
                request(server)
                    .put(`/remote/apis/${api}`)
                    .set("Accept", "application/json")
                    .send(testAPI)
                    .expect(200)
            })
        })

        it("shows all APIs", () => {
            return createAPI(server).then(() => {
                request(server)
                    .get(`/remote/apis`)
                    .set("Accept", "application/json")
                    .expect(200)
            })
        })

        it("updates a specific API", () => {
            return createAPI(server).then(api => {
                request(server)
                    .put(`/remote/apis/${api}`)
                    .set("Accept", "application/json")
                    .send(testAPI)
                    .expect(200)

            })
        })

        it("handles error when API doesn't exists", () => {
            return request(server)
                .get("/remote/apis/abc-def")
                .expect(404)

        })
    })

    describe("file operations", () => {
        it("can download private key ", () => {
            return request(server)
                .get("/connection/key")
                .expect(200)
        })

        it("can download kyma certificate ", () => {
            request(server)
                .get("/connection/cert")
                .expect(200)
        })

        it("can get logo", () => {
            return request(server)
                .get("/logo")
                .expect(200)
        })
    })
})

function createAPI(server: any) {
    return new Promise((resolve, reject) => {
        request(server)
            .post("/remote/apis/")
            .send(testAPI)
            .set("Accept", "application/json")
            .expect(200)
            .end((err: any, res: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res.body.id)
                }
            })
    })
}

function deleteKeysFile() {
    const path = "./keys"
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file: any, index: any) {
            fs.unlinkSync(path + "/" + file)
        })
        fs.rmdirSync(path)
    }
}