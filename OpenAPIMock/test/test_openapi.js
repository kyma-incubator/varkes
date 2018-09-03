var should = require('should');
var request = require('supertest');
var server = require('../app');

describe('controllers', function () {

  describe('test_openapi', function () {

    describe('GET cardtypes', function () {

      it('should return response 200', function (done) {

        request("http://localhost:10000")
          .get('/metadata')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'text/x-yaml; charset=utf-8')
          .expect(200, done)
      });


    });

  });

});
