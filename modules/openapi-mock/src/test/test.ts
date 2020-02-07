#!/usr/bin/env node
'use strict'


import * as  mock from "../server/app"
import * as request from "supertest"
import * as express from "express"
import * as config from "@varkes/configuration"
let configuration: config.Config;
describe('controllers', function () {
  before(async () => {
    configuration = await config.resolveFile('varkes_config.json', __dirname)
  })
  it('should work', function (done) {
    mock.init(configuration).then(function (mock: any) {
      let app = express()
      app.get('/api1/pets/:petId', (req: any, res: any, next: any) => {
        res.body = {
          success: req.params.petId
        }
        next()
      })
      app.use(mock)

      describe('GET metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata")
            .expect(200)
            .expect('Content-Type', 'text/x-yaml; charset=utf-8', done)
        });
      })

      describe('GET metadata for custom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata")
            .expect(200)
            .expect('Content-Type', 'text/x-yaml; charset=utf-8', done)
        });
      });

      describe('GET json metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata.json")
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      })

      describe('GET json metadata for custom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata.json")
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET yaml metadata for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/metadata.yaml")
            .expect(200)
            .expect('Content-Type', 'text/x-yaml; charset=utf-8', done)
        });
      })

      describe('GET yaml metadata for ustom metatdata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/mymetadata.yaml")
            .expect(200)
            .expect('Content-Type', 'text/x-yaml; charset=utf-8', done)
        });
      });

      describe('GET console for default metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/console")
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .expect(/'\/api1\/metadata.json'/)
            .expect(/pets openapi yaml/, done)
        });
      })

      describe('GET console for custom metadata endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api5/console")
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .expect(/'\/api5\/mymetadata.json'/)
            .expect(/courses/, done)
        });
      })

      describe('GET console without baspath configured', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api4/console")
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200)
            .expect(/'\/api4\/metadata.json'/)
            .expect(/pets/, done)
        });
      })

      describe('GET oauth for default oauth endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api1/authorizationserver/oauth/token")
            .send({ client_id: "1", client_secret: "2", grant_type: "3" })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET oauth for custom oauth endpoint', function () {
        it('should return response 200', function (done) {
          request(app)
            .post("/api5/myoauth/token")
            .send({ client_id: "1", client_secret: "2", grant_type: "3" })
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET validated request for openapi yaml', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/pets?Type=dog")
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/, done)
        });
      });

      describe('GET invalid request for openapi yaml', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api1/pets")
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET overwritten response for openapi yaml', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api1/pets/1")
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/"success":"1"/, done)
        });
      });

      describe('GET validated request for openapi json', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api2/pets?Type=dog")
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/, done)
        });
      });

      describe('GET invalid request for openapi json', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api2/pets")
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET validated request for swagger yaml', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api3/pets?type=dog")
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/, done)
        });
      });

      describe('GET invalid request for swagger yaml', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api3/pets")
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      describe('GET validated request for swagger json', function () {
        it('should return response 200', function (done) {
          request(app)
            .get("/api4/pets?type=dog")
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(/\[\]/, done)

        });
      });

      describe('GET invalid request for swagger json', function () {
        it('should return response 400', function (done) {
          request(app)
            .get("/api4/pets")
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', 'application/json; charset=utf-8', done)
        });
      });

      done()
    }).catch((error: Error) => done(error))
  }).timeout(5000)
});
