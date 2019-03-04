#!/usr/bin/env node
'use strict'

const mock = require('../server/app')
const request = require('supertest')
const express = require('express')

describe('tests controllers', function () {
    it('should work', function (done) {
        mock('./test/varkes_config.json').then(function (mock) {
            var app = express()
            app.use(mock)

            describe('GET metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET apis', function () {
                it('should return 400', function (done) {
                    request(app)
                        .get('/apis')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(400, done)
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
    })
})