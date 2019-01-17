var request = require('supertest');
var openapiApp = require("varkes-openapi-mock")("./varkes_config.js")

describe('tests odata controllers', function () {
    it('should work', function () {
        openapiApp.then(function (app) {
            describe('GET course 1 via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/courses/1')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/console')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
        })
    });
});
