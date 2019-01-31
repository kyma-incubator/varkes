var request = require('supertest');
var exampleApp = require("./app.js")

describe('tests openapi controllers', function () {
    it('should work', function () {
        exampleApp.then(function (app) {
            describe('GET courses', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/v1/health')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
        })
    });
});
