var request = require('supertest');
var openapiApp = require("varkes-openapi-mock")("./varkes_config.js")
var connectorApp = require("varkes-app-connector-client")("./varkes_config.js")

describe('tests odata controllers', function () {
    it('should work', function () {
        openapiApp.then(function (app) {
            describe('GET courses', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/courses')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200,done)
                });
            });
        })
        connectorApp.then(function (app) {
            describe('GET metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200,done)
                });
            });
            describe('GET connection info', function () {
                it('should return 400', function (done) {
                    request(app)
                        .get('/connection')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(400,done)
                });
            });
        })
    });
});
