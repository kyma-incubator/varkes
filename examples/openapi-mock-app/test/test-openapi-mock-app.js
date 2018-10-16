var request = require('supertest');
var server = require('../app');
var assert = require('assert');
describe('controllers', function () {

  describe('test_openapi', function () {

    describe('GET metadata', function () {

      it('should return response 200', function (done) {

        request(server)
          .get('/metadata')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/x-yaml; charset=utf-8')
          .expect(200, done)
      });


    });
    describe('GET courses', function () {

      it('should return an array with three items', function (done) {

        request(server)
          .get('/entity/courses')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .end(function (err, res) {
            assert(res.body.courses.length, 2);
            done();
          })
      });


    });

  });
  after(() => { server.stop() })

});
