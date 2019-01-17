var request = require('supertest');
var odataApp = require("varkes-odata-mock")("./varkes_config.js")
var connectorApp = require("varkes-app-connector-client")("./varkes_config.js")

describe('tests odata controllers', function () {
    it('should work', function () {
        server.then(function (app) {
            describe('GET course 1 via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/courses/1')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
            describe('GET course 1 via odata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/odata/Courses(\'1\')')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/console')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
        })
    });
});
