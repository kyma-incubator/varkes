#!/usr/bin/env node
'use strict'

const request = require('supertest');
const exampleApp = require("./app.js")

describe('tests stress apis', function () {
    it('should work', function (done) {
        this.timeout(20000);
        exampleApp.then(function (app) {

            describe('GET Advertisements via odata1', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/odata/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });
            describe('GET Advertisements via odata100', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api100/odata/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });
            describe('GET schools1', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api1/v1/schools')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });
            describe('GET schools100', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api100/v1/schools')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET varkes metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect(200)
                        .expect('Content-Type', 'text/yaml; charset=UTF-8', done)
                });
            });

            describe('GET info', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/info')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            done()
        }).catch(error => done(error))
    }).timeout(10000);
});
