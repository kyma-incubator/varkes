process.env.NODE_ENV = 'test';
var request = require('supertest');
var server = require("../server/server");
var CONFIG = require("../config")
var LOGGER = require("../server/logger")
const fs = require("fs")
const path = require("path")
const serviceMetadata = path.resolve(CONFIG.assetDir, "basic-service-metadata.json")
deleteNonEmptyFolder(CONFIG.keyDir)
require("../prestart")


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


    var confURL
    it("can get token from kyma", done => {
        request("http://127.0.0.1:8080/v1/remoteenvironments/hmc-default/tokens")
            .post("").expect(201).end((err, res) => {
                console.log(res.body)
                confURL = res.body
                !err ? done() : {}
            })
    })

    it("kyma can create certs from token", done => {


        request(server)
            .post(CONFIG.startConnUrl).send(

                confURL

            ).set('Accept', 'application/json').
            expect(200).end((err, res) => {

                !err ? done() : {}
            })
    })

})
describe("service endpoints", () => {


    var serviceId;
    it("shows all services at /services", (done) => {
        request(server)
            .get("/")
            .expect(200, done)
    })
    it("handles error when service doesn't exists", (done) => {
        request(server)
            .get("/services/abc-def")
            .expect(200).end(
                (err, response) => {
                    response.body.error == 404 ? {} : done()
                }
            )
    })

    it("creates a new service", (done) => {
        request(server)
            .post("/services/")
            .send(
                fs.readFileSync(serviceMetadata)
            ).set("Accept", "application/json")
            .expect(200).end((err, res) => {
                serviceId = res.body.id
                !err ? done() : {}
            })
    })

    it("shows a specific service", (done) => {
        request(server)
            .get("/services/abc-def")
            .expect(200, done)
    })
    it("updates a specific service", done => {
        request(server)
            .put(`/services/${serviceId}`).
            send(
                fs.readFileSync(serviceMetadata)
            ).set("Accept", "application/json").expect(200, done)
    })

    it("deletes a specific service", done => {
        request(server)
            .delete(`/services/${serviceId}`)
            .expect(200, done)
    })



    after(() => {
        deleteNonEmptyFolder(CONFIG.keyDir)
        server.close()
    })
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