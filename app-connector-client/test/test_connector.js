process.env.NODE_ENV = 'test';

var request = require('supertest');
var server = require("../server/server")("./varkes_config.js");
var CONFIG = require("../config")
const fs = require("fs")
const path = require("path")
const serviceMetadata = path.resolve("test/integration/basic-service-metadata.json")
//deleteNonEmptyFolder(CONFIG.keyDir)
require("../prestart").generatePrivateKey(data => console.log(data))

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

        require("./get_token").getToken(data => {
            confURL = data
            request(server)
                .post("/connection").send(

                    { "url": confURL }

                ).set('Accept', 'application/json').
                expect(200).end((err, res) => {

                    !err ? done() : {}
                })
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
            .get("/certificates/private-key")
            .expect(200, done)
    })


    it("can download kyma certificate ", done => {
        request(server)
            .get("/certificates/kyma-cert")
            .expect(200, done)
    })
    it("can get connection info", done => {
        request(server)
            .get("/connection")
            .expect(200, done)
    })


    // after(() => {
    //     fs.unlinkSync("test.log")
    //     //deleteNonEmptyFolder(CONFIG.keyDir)
    //     server.close()
    // })
})



function deleteNonEmptyFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}