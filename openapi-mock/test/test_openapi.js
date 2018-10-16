var request = require('supertest');
var server = require('../app');
describe('controllers', function () {
  before(() => {
    server.parseSpecFile();
  });
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

  });
  after(() => { server.stop() })

});
