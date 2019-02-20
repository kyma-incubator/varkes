var request = require('supertest');
var exampleApp = require("./app.js")

describe('tests kyma controllers', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {
            describe('GET connector api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/connector/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET events api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/events/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET metadata api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/metadata/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET connector api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/connector/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET events api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/events/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET metadata api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/kyma/metadata/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
        }).finally(done);
    });
});
