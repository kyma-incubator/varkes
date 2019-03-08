
var request = require('supertest');
const mock = require('../server/app')
const express = require("express")
const fs = require("fs")
const path = require("path")
const serviceMetadata = path.resolve("test/service-metadata.json")
require("../server/keys").generatePrivateKey()

const port = 10000
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`


describe('basic routes', function () {
    before(async () => {
        await mock("./test/varkes_config.json").then((mock) => {
            server = express()
            server.use(mock)

        })
    })
    it('responds to /', function testSlash(done) {
        request(server)
            .get('/')
            .expect(200, done);
    });

    it("shows meteadata", done => {
        request(server)
            .get("/metadata")
            .expect(200, done)
    })
    it('404 everything else', function testPath(done) {
        request(server)
            .get('/foo/bar')
            .expect(404, done);
    });
});

describe("Connect to kyma", function () {
    it("kyma can create certs from token", done => {
        confURL = tokenURL
        request(server)
            .post("/connection").send(

                { "url": confURL }

            ).set('Accept', 'application/json').
            expect(200).end((err, res) => {

                !err ? done() : {}
            })
    }).timeout(6000)
})

describe("api endpoints", () => {
    var serviceId;

    it("creates a new service", (done) => {
        request(server)
            .post("/apis/")
            .send(
                JSON.parse(fs.readFileSync(serviceMetadata))
            ).set("Accept", "application/json")
            .expect(200).end((err, res) => {
                serviceId = res.body.id
                !err ? done() : console.log(res.body)

                it("shows a specific service", (done) => {
                    request(server)
                        .get(`/apis/${serviceId}`)
                        .expect(200).end(
                            (err, response) => {
                                !err ? done() : console.log(response)
                            }
                        )
                })
            })
    })



    it("handles error when service doesn't exists", (done) => {
        request(server)
            .get("/apis/abc-def")
            .expect(200).end(
                (err, response) => {
                    response.body.error == 404 ? {} : done()
                }
            )
    })


    it("updates a specific service", done => {
        request(server)
            .put(`/apis/${serviceId}`).
            send(
                JSON.parse(fs.readFileSync(serviceMetadata))
            ).set("Accept", "application/json").expect(200, done)
    })
    after(() => {
        it("deletes a specific service", done => {
            request(server)
                .delete(`/apis/${serviceId}`)
                .expect(200).end((err, res) => {
                    !err ? done() : {}
                })
        }).timeout(5000)
    })

})


describe("file operations", () => {
    it("can download private key ", done => {
        request(server)
            .get("/connection/key")
            .expect(200, done)
    })

    it("can download kyma certificate ", done => {
        request(server)
            .get("/connection/cert")
            .expect(200, done)
    })
    it("can get connection info", done => {
        request(server)
            .get("/connection")
            .expect(200, done)
    })
})


