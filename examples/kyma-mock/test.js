var request = require('supertest');
var exampleApp = require("./app.js")

describe('tests kyma controllers', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {
            describe('GET connector api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/connectorapi/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET events api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/eventsapi/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET metadata api health', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadataapi/v1/health')
                        .expect(200, done)
                });
            });
            describe('GET connector api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/connectorapi/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET events api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/eventsapi/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET metadata api console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadataapi/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
        }).finally(done);
    });
});
