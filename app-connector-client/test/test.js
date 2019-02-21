
var request = require('supertest');
var server = require("../server/app")("test/varkes_config.json");

describe('tests controllers', function () {
    it('should work', () => {
        server.then(function (app) {
            describe('GET metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET apis', function () {
                it('should return 400', function (done) {
                    request(app)
                        .get('/apis')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(400, done)
                });
            });
            describe('GET connection info', function () {
                it('should return 400', function (done) {
                    request(app)
                        .get('/connection')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(400, done)
                });
            });
        })
    })
})