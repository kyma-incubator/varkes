var request = require('supertest');
var server = require('../server/app')("./test/varkes_config.json");
describe('controllers', function () {

    it('test_odata', function (done) {
        server.then(function (app) {
            describe('GET Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Advertisements via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/odata/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
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
            describe('GET metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/odata/$metadata')
                        .set('Accept', 'application/xml')
                        .expect('Content-Type', 'application/xml; charset=utf-8')
                        .expect(200, done)
                });
            });
        }).then(done);
    });
});
