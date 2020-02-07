#!/usr/bin/env node
'use strict'

import * as mock from "../server/app"
import * as config from "@varkes/configuration"

const request = require('supertest')
const express = require('express')
let configuration: config.Config;
describe('test app', function () {
    before(async () => {
        configuration = await config.resolveFile('varkes_config.json', __dirname)
    })
    it('should work', (done) => {
        mock.init(configuration).then((mock: any) => {
            let app = express()
            app.use(mock)

            describe('GET Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/service.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/northwind/northwind.svc/Summary_of_Sales_by_Years')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET non-existing Advertisements via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/service.svc/Advertisements/10')
                        .set('Accept', 'application/json')
                        .expect(404)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET non-existing Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/api/northwind/northwind.svc/Summary_of_Sales_by_Years/10')
                        .set('Accept', 'application/json')
                        .expect(404)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('POST/GET Advertisement via API', function () {
                it('should return response 200', function () {
                    return new Promise((resolve, reject) => {
                        request(app)
                            .post('/api/service.svc/Advertisements')
                            .send({
                                ID: "0",
                                Name: "string",
                                AirDate: "2019-03-28T15:29:16.871Z"
                            })
                            .set('Accept', 'application/json')
                            .expect(200)
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"ID":"0"/)
                            .end((err: any, res: any) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(res.body.id)
                                }
                            })
                    }).then(() => {
                        return request(app)
                            .get('/api/service.svc/Advertisements/1')
                            .set('Accept', 'application/json')
                            .expect(200)
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"ID":"0"/)
                    })
                });
            });

            describe('POST/GET Summary_of_Sales_by_Years via API', function () {
                it('should return response 200', function () {
                    return new Promise((resolve, reject) => {
                        request(app)
                            .post('/api/northwind/northwind.svc/Summary_of_Sales_by_Years')
                            .send({
                                "OrderID": 0,
                                "Subtotal": 0
                            })
                            .set('Accept', 'application/json')
                            .expect(200)
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"id":1/)
                            .end((err: any, res: any) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(res.body.id)
                                }
                            })
                    }).then(() => {
                        return request(app)
                            .get('/api/northwind/northwind.svc/Summary_of_Sales_by_Years/1')
                            .set('Accept', 'application/json')
                            .expect(200)
                            .expect('Content-Type', 'application/json; charset=utf-8')
                            .expect(/"id":1/)
                    })
                });
            });

            describe('GET Advertisements via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service.svc/Advertisements')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET Summary_of_Sales_by_Years via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/northwind.svc/Summary_of_Sales_by_Years')
                        .set('Accept', 'application/json')
                        .expect(200)
                        .expect('Content-Type', 'application/json; charset=utf-8', done)
                });
            });

            describe('GET services console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/service.svc/console/')
                        .expect(200)
                        .expect('Content-Type', 'text/html; charset=UTF-8', done)
                });
            });

            describe('GET northwind console', function () {
                it('should return 200', function (done) {
                    request(app)
                        .get('/api/northwind/northwind.svc/console/')
                        .expect(200)
                        .expect('Content-Type', 'text/html; charset=UTF-8', done)
                });
            });

            describe('GET services metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/service.svc/$metadata')
                        .set('Accept', 'application/xml')
                        .expect(200)
                        .expect('Content-Type', 'application/xml; charset=utf-8', done)
                });
            });

            describe('GET northwind metdata via odata', function () {
                it('should return response 200', function (done) {
                    request(app)
                        .get('/northwind/northwind.svc/$metadata')
                        .set('Accept', 'application/xml')
                        .expect(200)
                        .expect('Content-Type', 'application/xml; charset=utf-8', done)
                });
            });

            done()
        }).catch((error: Error) => done(error))
    }).timeout(5000);
});
