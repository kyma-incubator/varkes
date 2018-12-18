var request = require('supertest');
var server = require('../server/server')("../config.js");
describe('controllers', function () {

    describe('test_odata', function () {

        describe('GET metadata', function () {

            it('should return response 200', function (done) {

                request(server)
                    .get('/marketing/metadata')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', 'text/xml; charset=utf-8')
                    .expect(200, done)
            });


        });

    });
    after(() => {
        server.stop();
    })
});
