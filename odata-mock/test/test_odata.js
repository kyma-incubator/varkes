var request = require('supertest');
var server = require('../server/server')("../config.js");
describe('controllers', function (done) {

    it('test_odata', function () {
        server.then(function (result) {

            describe('GET metadata', function () {

                it('should return response 200', function () {

                    request(result)
                        .get('/marketing/metadata')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'text/xml; charset=utf-8')
                        .expect(200, done)
                });


            });
        });

    });
    // after(() => {
    //     result.stop();
    // })
});
