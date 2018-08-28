process.env.NODE_ENV = 'test';


var request = require('supertest');
var server = require("../server/server");
var CONFIG = require("../config")
const fs = require("fs")

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

    it("can create private key", done => {
        require("../prestart")
        done()
    })
    var confURL
    it("can get token from kyma", done => {
        request("http://localhost:8080/v1/remoteenvironments/hmc-default/tokens")
            .post("").expect(201).end((err, res) => {
                console.log(res.body.url)
                confURL = res.body
                !err ? done() : {}
            })
    })

    it("kyma can create certs from token", done => {
        console.log("conf: " + confURL)

        request(server)
            .post(CONFIG.startConnUrl).send(

                confURL

            ).set('Accept', 'application/json').
            expect(200).end((err, res) => {
                console.log(res.body)
                console.log(err)
                !err ? done() : {}
            })
    })

    describe("nested", () => {
        it("1234", done => { done() })
    })

    after(() => {
        deleteNonEmptyFolder(CONFIG.keyDir)
    })
})


//delete all keys
/*describe("keys deleted", done => {

   
})*/

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