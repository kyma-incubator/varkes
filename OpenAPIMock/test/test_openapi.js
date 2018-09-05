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
    describe('GET card types', function () {

      it('should return an array with three items', function (done) {

        request(server)
          .get('/1/cardtypes')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .end(function (err, res) {
            assert(res.body.cardTypes.length, 3);
            done();
          })
      });


    });

  });
  after(() => { server.close() })

});
