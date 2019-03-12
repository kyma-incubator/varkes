#!/usr/bin/env node
'use strict'

var request = require('supertest');
const mock = require('../server/app')
const express = require("express")
const fs = require("fs")
const path = require("path")
const kyma = require("@varkes/example-kyma-mock")
const serviceMetadata = path.resolve("test/service-metadata.json")

const port = 10001 //! listen in different port
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`

describe("should work", () => {
    var kymaServer
    var server
    before(async () => { //* start kyma mock before tests
        kyma.then(app => {
            kymaServer = app.listen(port)
        })
        await mock("./test/varkes_config.json").then((mock) => {
            server = express()
            server.use(mock)
        })
    })
    after(() => { //* stop kyma mock after tests
        kymaServer.close()
    })

    describe('basic routes', function () {
        it('responds to /', function testSlash() {
            return request(server)
                .get('/')
                .expect(200);
        });

        it("shows meteadata", () => {
            return request(server)
                .get("/metadata")
                .expect(200)
        })
        it('404 everything else', function testPath() {
            return request(server)
                .get('/foo/bar')
                .expect(404);
        });
    });

    describe("Connect to kyma", function () {
        it("kyma can create certs from token", () => {
            return request(server)
                .post("/connection").send(

                    { "url": tokenURL }

                ).set('Accept', 'application/json').
                expect(200)
        })
    })

    describe("api endpoints", () => {
        it("creates a new service", () => {
            return createServiceAndReturnId(server)
        })

        it("deletes a service", async () => {
            const serviceId = await createServiceAndReturnId(server)
            return request(server)
                .put(`/apis/${serviceId}`).
                send(
                    JSON.parse(fs.readFileSync(serviceMetadata))
                ).set("Accept", "application/json")
                .expect(200)

        })

        it("shows a specific service", async () => {
            const serviceId = await createServiceAndReturnId(server)
            return request(server)
                .get(`/apis/${serviceId}`)
                .set("Accept", "application/json")
                .expect(200)
        })

        it("updates a specific service", async () => {
            const serviceId = await createServiceAndReturnId(server)
            return request(server)
                .put(`/apis/${serviceId}`).
                send(
                    JSON.parse(fs.readFileSync(serviceMetadata))
                ).set("Accept", "application/json")
                .expect(200)
        })
    })


    it("handles error when service doesn't exists", () => {
        return request(server)
            .get("/apis/abc-def")
            .expect(404)

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
        it("can get connection info", () => {
            return request(server)
                .get("/connection")
                .expect(200)
        })
    })
    describe("test controllers", () => {
        it('should return 200', () => {
            return request(server)
                .get('/metadata')
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
                .expect(200)
        });


        it('should return 200', () => {
            return request(server)
                .get('/metadata')
                .expect('Content-Type', 'text/yaml; charset=UTF-8')
                .expect(200)
        });


        it('should return 200', () => {
            request(server)
                .get('/apis')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200)
        });


        it('should return 200', () => {
            return request(server)
                .get('/connection')
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200)
        });
    })
})

function createServiceAndReturnId(server) {
    return new Promise((resolve, reject) => {
        request(server)
            .post("/apis/")
            .send(
                JSON.parse(fs.readFileSync(serviceMetadata))
            )
            .set("Accept", "application/json")
            .expect(200)
            .end((err, res) => {
                var serviceId = res.body.id
                !err ? resolve(serviceId) : reject(err)
            })
    })
}
