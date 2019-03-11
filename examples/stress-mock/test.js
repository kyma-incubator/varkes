#!/usr/bin/env node
'use strict'

const request = require('supertest');
const exampleApp = require("./app.js")

describe('tests stress apis', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {

            describe('GET courses', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api156/courses')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET schools', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api7/schools')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api156/console')
                        .expect('Content-Type', 'text/html; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET api1 metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api156/courseMetadata')
                        .expect('Content-Type', 'text/x-yaml; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET varkes metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET connection info', function () {
                it('should return 400', function (done) {
                    request(app)
                        .get('/connection')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(400, done)
                });
            });

            done()
        }).catch(error => done(error))
    }).timeout(10000);
});
