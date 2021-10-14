var {api, event, connection} = require("../server/app");
var kyma = require("@varkes/example-kyma-mock");
import * as fs from "fs";
import * as chai from "chai";
chai.use(require("chai-match"));
const expect = chai.expect;
import * as path from "path";
import { certificate } from "../server/connection";
const assert = chai.assert;

const port = 10001; //! listen in different port
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`;
const connectionExpected = fs.readFileSync(path.resolve("dist/test/expect/connection.json")).toString();
const schoolsAPI = fs.readFileSync(path.resolve("dist/test/schools.json")).toString();
const schoolsExpectedAPI = fs.readFileSync(path.resolve("dist/test/expect/schools.json")).toString();
const updatedSchoolsAPI = fs.readFileSync(path.resolve("dist/test/updatedSchools.json")).toString();
const eventAPI = fs.readFileSync(path.resolve("dist/test/event.json")).toString();
const eventPublishAPI = fs.readFileSync(path.resolve("dist/test/eventPublish.json")).toString();
const eventResponseExpected = fs.readFileSync(path.resolve("dist/test/expect/event.json")).toString();
const cloudEventResponseExpected = fs.readFileSync(path.resolve("dist/test/expect/cloudevent.json")).toString();
const cloudEventBinaryResponseExpected = fs.readFileSync(path.resolve("dist/test/expect/cloudeventbinary.json")).toString();

describe("should work", () => {
  let kymaServer: any;
  before(async () => {
    //* start kyma mock before tests
    deleteKeysFile();
    await kyma.then((app: any) => {
      kymaServer = app.listen(port);
    });
    connection.init();
    let connectionData = await connection.connect(tokenURL, false, false);
    await api.create(JSON.parse(schoolsAPI));
    await api.create(JSON.parse(eventAPI));
    return expect(new RegExp(JSON.stringify(connectionData), "g")).to.match(
      new RegExp(JSON.stringify(JSON.parse(connectionExpected)), "g")
    );
  });

  after(() => {
    //* stop kyma mock after tests
    connection.destroy();
    kymaServer.close(() => {
      deleteKeysFile();
    });
  });
  describe("testing apis", () => {
    it("register school api", () => {
      return api.findAll().then((result: any) => {
        expect(JSON.stringify(result).replace(/\\/g, "")).to.match(
          new RegExp(JSON.stringify(JSON.parse(schoolsExpectedAPI)), "g")
        );
      });
    });
    it("update an API", () => {
      return api.create(JSON.parse(schoolsAPI)).then((createdApi: any) => {
        return api.update(JSON.parse(updatedSchoolsAPI), createdApi.id).then((updatedApi: any) => {
          assert(JSON.stringify(updatedApi).indexOf("error") <= -1);
        });
      });
    });
    it("delete school api", () => {
      return api
        .create(JSON.parse(schoolsAPI))
        .then((createdApi: any) => {
          return api.remove(createdApi.id);
        })
        .then((result: any) => {
          assert(JSON.stringify(result).indexOf("error") <= -1);
        });
    });
    it("send legacy event", () => {
      let eventData = {
        "event-type": "customer.created",
        "event-type-version": "v1", //event types normally end with .v1
        "event-time": new Date().toISOString(),
        data: JSON.parse(eventPublishAPI),
      };
      return event.sendLegacyEvent(eventData).then((result: any) => {
        expect(JSON.stringify(result)).to.match(new RegExp(JSON.stringify(JSON.parse(eventResponseExpected)), "g"));
      });
    });
    it("send cloud event", () => {
      let eventData = {
        "specversion": "1.0",
        "source": "/default/sap.kyma/kt1",
        "type": "sap.kyma.FreightOrder.Arrived.v1",
        "id": "A234-1234-1234",
        data: JSON.parse(eventPublishAPI),
      };
      return event.sendCloudEvent(eventData).then((result: any)=> {
        expect(JSON.stringify(result)).to.match(new RegExp(JSON.stringify(JSON.parse(cloudEventResponseExpected)), "g"));
      });
    });
    it("send cloud event in binary mode", () => {
      let eventData = {
        data: JSON.parse(eventPublishAPI),
      };
      let eventHeader = {
        "ce-specversion": "1.0",
        "ce-source": "/default/sap.kyma/kt1",
        "ce-type": "sap.kyma.FreightOrder.Arrived.v1",
        "ce-id": "A234-1234-1234",
      }
      return event.sendCloudEventBinary(eventData, eventHeader).then((result: any)=> {
        expect(JSON.stringify(result)).to.match(new RegExp(JSON.stringify(JSON.parse(cloudEventBinaryResponseExpected)), "g"));
      });
    });
    it("gets key", () => {
      return expect(connection.privateKey()).exist
    });
    it("gets cert", () => {
      return expect(connection.certificate()).exist
    });
    it("renew cert", () => {
      let cert=connection.certificate().toString()
      return connection.renewCertificate().then((result: any) => {
        expect(connection.certificate().toString()).equals(cert) //same as mock returns the same
      });
    });
  });
});

function deleteKeysFile() {
  const path = "./keys";
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      fs.unlinkSync(path + "/" + file);
    });
    fs.rmdirSync(path);
  }
}
