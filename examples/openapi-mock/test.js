#!/usr/bin/env node
'use strict'

const request = require('supertest');
const exampleApp = require("./app.js")

describe('test app', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {

            describe('GET courses', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/courses')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });

            done()
        }).catch(error => done(error))
    });
});
