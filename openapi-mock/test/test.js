var request = require('supertest');
var app = require("express")();
var server = require('../server/app')('./test/varkes_config.json');
describe('controllers', function () {
  it('should work', function () {
    server.then(function (app) {
      describe('GET metadata for pets', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      })

      describe('GET collection for pets', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/pets")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET oauth for pets', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api1/authorizationserver/oauth/token")
            .send({client_id:"1",client_secret:"2",grant_type:"3"})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET metadata for courses', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api2/mymetadata")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'text/x-yaml; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET oauth for courses', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api2/myoauth/token")
            .send({client_id:"1",client_secret:"2",grant_type:"3"})
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });

      describe('GET collection for courses', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api2/courses")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200, done)
        });
      });
    })
  })
});
