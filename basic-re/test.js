process.env.NODE_ENV = "test"

var request = require("supertest")
var server = require("./index")

describe("basic routes", function () {


    it("responds to slash", (done) => {
        request(server)
            .get("/")
            .expect(200, done);
    })


    it("responds to api call", (done) => {
        request(server)
            .get("/myapi")
            .expect(200, done);
    })

    it("responds to token call", (done) => {
        request(server)
            .post("/oauth/token")
            .expect(200, done)
    })

    after(() => server.close())

})
