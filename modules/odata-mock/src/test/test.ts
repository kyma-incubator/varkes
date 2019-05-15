#!/usr/bin/env node
'use strict'

import { init as mock } from "../server/app"
const request = require('supertest')
const express = require('express')

describe('test app', function () {
    it('should work', (done) => {
        mock('./varkes_config.json', __dirname).then((mock: any) => {
            var app = express()
            app.use(mock)

            describe('GET Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service/api/service.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/api/northwind.svc/Summary_of_Sales_by_Years')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET non-existing Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service/api/service.svc/Advertisements/10')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(404, done)
                });
            });

            describe('GET non-existing Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/api/northwind.svc/Summary_of_Sales_by_Years/10')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(404, done)
                });
            });

            describe('POST/GET Advertisement via API', function () {
                it('should return response 200', function () {
                    return new Promise((resolve, reject) => {
                        request(app)
                            .post('/service/api/service.svc/Advertisements')
                            .send({
                                ID: "0",
                                Name: "string",
                                AirDate: "2019-03-28T15:29:16.871Z"
                            })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"ID":"0"/)
                            .expect(200)
                            .end((err: any, res: any) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(res.body.id)
                                }
                            })
                    }).then(() => {
                        return request(app)
                            .get('/service/api/service.svc/Advertisements/1')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"ID":"0"/)
                            .expect(200)
                    })
                });
            });

            describe('POST/GET Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function () {
                    return new Promise((resolve, reject) => {
                        request(app)
                            .post('/northwind/api/northwind.svc/Summary_of_Sales_by_Years')
                            .send({
                                "OrderID": 0,
                                "Subtotal": 0
                            })
                            .set('Accept', 'application/json')
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"id":1/)
                            .expect(200)
                            .end((err: any, res: any) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(res.body.id)
                                }
                            })
                    }).then(() => {
                        return request(app)
                            .get('/northwind/api/northwind.svc/Summary_of_Sales_by_Years/1')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"id":1/)
                            .expect(200)
                    })
                });
            });

            describe('GET Advertisements via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service/odata/service.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET Summary_of_Sales_by_Years via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/odata/northwind.svc/Summary_of_Sales_by_Years')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', 'application/json; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET services console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/service/api/service.svc/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET northwind console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/northwind/api/northwind.svc/console/')
                        .expect('Content-Type', 'text/html; charset=UTF-8')
                        .expect(200, done)
                });
            });

            describe('GET services metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service/odata/service.svc/$metadata')
                        .set('Accept', 'application/xml')
                        .expect('Content-Type', 'application/xml; charset=utf-8')
                        .expect(200, done)
                });
            });

            describe('GET northwind metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/odata/northwind.svc/$metadata')
                        .set('Accept', 'application/xml')
                        .expect('Content-Type', 'application/xml; charset=utf-8')
                        .expect(200, done)
                });
            });

            done()
        }).catch((error: Error) => done(error))
    }).timeout(5000);
});
