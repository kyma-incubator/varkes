#!/usr/bin/env node
'use strict'

const mock = require('../server/app')
const request = require('supertest')
const express = require('express')

describe('test app', function () {
    it('should work', (done) => {
        mock('./test/varkes_config.json', __dirname).then((mock: any) => {
            var app = express()
            app.use(mock)

            describe('GET Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Advertisements via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/odata/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET loopback console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/odata/$metadata')
                        .set('Accept', 'application/xml')
                        .expect('Content-Type', 'application/xml; charset=utf-8')
                        .expect(200, done)
                });
            });

            done()
        }).catch((error: Error) => done(error))
    }).timeout(5000);
});
