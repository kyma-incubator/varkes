var request = require('supertest');
var server = require('../server/app')("./test/varkes_config.js");
describe('controllers', function () {

    it('test_odata', function (done) {
        server.then(function (app) {
            describe('GET course 1 via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/courses/1')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
            describe('GET course 1 via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/odata/Courses(\'1\')')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200,done)
                });
            });
        }).finally(done);
    });
});
