var request = require('supertest');
<<<<<<< HEAD
var app = require("express")();
var server = require('../server/app')('./test/varkes_config.json');
=======
var server = require('../server/app')('./test/varkes_config.json');

>>>>>>> master
describe('controllers', function () {
  it('should work', function (done) {
    server.then(function (app) {
      describe('GET metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata")
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      })

      describe('GET metadata for custom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata")
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET json metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata.json")
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      })

      describe('GET json metadata for custom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata.json")
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET yaml metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata.yaml")
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      })

      describe('GET yaml metadata for ustom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata.yaml")
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET console for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/console")
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done)
            .expect(/'\/api1\/metadata.json'/)
            .expect(/pets openapi yaml/)
        });
      })
    
      describe('GET console for custom metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/console")
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done)
            .expect(/'\/api5\/mymetadata.json'/)
            .expect(/courses/)
        });
      })

      describe('GET oauth for default oauth endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api1/authorizationserver/oauth/token")
            .send({client_id:"1",client_secret:"2",grant_type:"3"})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET oauth for custom oauth endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api5/myoauth/token")
            .send({client_id:"1",client_secret:"2",grant_type:"3"})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET validated request for openapi yaml', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/pets?Type=dog")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/)
            .expect(200, done)
        });
      });

      describe('GET invalid request for openapi yaml', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api1/pets")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, done)
        });
      });

      describe('GET validated request for openapi json', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api2/pets?Type=dog")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/)
            .expect(200, done)
        });
      });

      describe('GET invalid request for openapi json', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api2/pets")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, done)
        });
      });

      describe('GET validated request for swagger yaml', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api3/pets?type=dog")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/)
            .expect(200, done)
        });
      });

      describe('GET invalid request for swagger yaml', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api3/pets")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, done)
        });
      });

      describe('GET validated request for swagger json', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api4/pets?type=dog")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/)
            .expect(200, done)
        });
      });

      describe('GET invalid request for swagger json', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api4/pets")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400, done)
        });
      });
    }).finally(done);
  })
});
