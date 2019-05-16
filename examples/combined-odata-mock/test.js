#!/usr/bin/env node
'use strict'

const request = require('supertest');
const exampleApp = require("./app.js")

describe('test app', function () {
    it('should work', function (done) {
        exampleApp.then(function (app) {

            describe('GET Advertisements via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/product.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Categories via API', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/northwind.svc/Categorys')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Advertisements via odata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/odata/product.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET Categories via odata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/odata/northwind.svc/Categorys')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });
            describe('GET varkes console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/console')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET product console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/product.svc/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET northwind console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/northwind.svc/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET metadata', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/metadata')
                        .expect('Content-Type', 'text/yaml; charset=UTF-8')
                        .expect(200, done)
                });
            });
            describe('GET info', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/info')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });

            done()
        }).catch(error => done(error))
    }).timeout(5000);
});
