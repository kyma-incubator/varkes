var request = require('supertest');
var exampleApp = require("./app.js")

describe('tests odata controllers', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {
            describe('GET Advertisements via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Advertisements via odata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/odata/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET varkes console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/console')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET loopback console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
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
        }).finally(done);
    });
});
