#!/usr/bin/env node
'use strict'

const request = require('supertest');
const exampleApp = require("./app.js")

describe('tests odata controllers', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {

            describe('GET Advertisements via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/services.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });
            describe('GET Advertisements via odata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/services.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });
            describe('GET loopback console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/services.svc/console/')
                        .expect(200)
                        .expect('Content-Type', 'text/html; charset=UTF-8', done)
                });
            });

            done()
        }).catch(error => done(error))
    }).timeout(5000);
});
