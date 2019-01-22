
var request = require('supertest');
var server = require("../server/app")("test/varkes_config.js");
const fs = require("fs")
const path = require("path")
const serviceMetadata = path.resolve("test/service-metadata.json")

if (process.env.NODE_ENV == "test") {
    require("../server/keys").generatePrivateKey()

    describe('basic routes', function () {
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
            confURL = process.env.TOKENURL
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
        it("shows all services at /apis", (done) => {
            request(server)
                .get("/")
                .expect(200, done)
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
        it("creates a new service", (done) => {
            request(server)
                .post("/apis/")
                .send(
                    fs.readFileSync(serviceMetadata)
                ).set("Accept", "application/json")
                .expect(200).end((err, res) => {
                    serviceId = res.body.id
                    !err ? done() : {}

                    it("deletes a specific service", done => {
                        request(server)
                            .delete(`/apis/${serviceId}`)
                            .expect(200).end((err, res) => {
                                console.log(res)
                                !err ? done() : console.log(err)
                            })
                    }).timeout(3000)

                })
        })

        it("shows a specific service", (done) => {
            request(server)
                .get("/apis/abc-def")
                .expect(200, done)
        })

        it("updates a specific service", done => {
            request(server)
                .put(`/apis/${serviceId}`).
                send(
                    fs.readFileSync(serviceMetadata)
                ).set("Accept", "application/json").expect(200, done)
        })

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
}