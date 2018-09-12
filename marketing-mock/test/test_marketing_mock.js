var request = require('supertest');
var server = require('../server/server');
var assert = require('assert');
describe('controllers', function () {

    describe('test_odata', function () {

        describe('GET metadata', function () {

            it('should return response 200', function (done) {

                request(server)
                    .get('/odata/$metadata')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', 'application/xml; charset=utf-8')
                    .expect(200, done)
            });


        });

        describe('GET AssignedInterestsTypes', function () {

            it('should return response 200', function (done) {

                request(server)
                    .get('/odata/AssignedInterestsTypes(1)')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .end(function (err, res) {
                        assert(res.body.d.id, 1);
                        done();
                    })
            });


        });

        describe('GET TeamMembersTypes', function () {

            it('should return response 200', function (done) {

                request(server)
                    .get('/odata/TeamMembersTypes(1)')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', 'application/json; charset=utf-8')
                    .end(function (err, res) {
                        assert(res.body.d.CampaignTemplate, 'CampaignTemplate 1');
                        done();
                    })
            });


        });

    });

});
