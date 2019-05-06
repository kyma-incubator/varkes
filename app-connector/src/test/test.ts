import { api, event, connection } from '../server/app';
var kyma = require("@varkes/example-kyma-mock");
import * as fs from 'fs';
import * as chai from 'chai';
chai.use(require('chai-match'));
const expect = chai.expect;
import * as path from 'path';
const assert = chai.assert;

const port = 10001 //! listen in different port
const tokenURL = `http://localhost:${port}/connector/v1/applications/signingRequests/info?token=123`
const connectionExpected = fs.readFileSync(path.resolve("dist/test/expect/connection.json")).toString();
const schoolsAPI = fs.readFileSync(path.resolve("dist/test/schools.json")).toString();
const schoolsExpectedAPI = fs.readFileSync(path.resolve("dist/test/expect/schools.json")).toString();
const updatedSchoolsAPI = fs.readFileSync(path.resolve("dist/test/updatedSchools.json")).toString();
const updatedSchoolsExpectedAPI = fs.readFileSync(path.resolve("dist/test/expect/updatedSchools.json")).toString();
var apiId: any;
describe("should work", () => {
    var kymaServer: any
    before(async () => { //* start kyma mock before tests
        deleteKeysFile()
        await kyma.then((app: any) => {
            kymaServer = app.listen(port)
        })
        connection.init();
        let connectionData = await connection.connect(tokenURL)
        let createdApi: any = await api.create(JSON.parse(schoolsAPI));
        apiId = createdApi.id;
        return expect(new RegExp(JSON.stringify(connectionData), "g")).to.match(new RegExp(JSON.stringify(JSON.parse(connectionExpected)), "g"));
    })

    after(() => { //* stop kyma mock after tests
        kymaServer.close(() => {
            deleteKeysFile()
        })
    })
    describe('testing apis', () => {
        it('register school api', () => {
            return api.findAll().then((result) => {
                expect(JSON.stringify(result).replace(/\\/g, '')).to.match(new RegExp(JSON.stringify(JSON.parse(schoolsExpectedAPI)), "g"))
            })
        })
        it("update an API", () => {
            console.log("api id " + apiId);
            return api.update(JSON.parse(updatedSchoolsAPI), apiId).then((updatedApi) => {
                console.log("************id ********** " + updatedApi);
                return api.findOne(updatedApi)
            }).then((result) => {
                expect(JSON.stringify(result).replace(/\\/g, '')).to.match(new RegExp(JSON.stringify(JSON.parse(updatedSchoolsExpectedAPI)), "g"))
            })

        });
        it('delete school api', () => {
            return api.create(JSON.parse(schoolsAPI)).then((createdApi: any) => {
                return api.delete(createdApi.id)

            }).then((result) => {
                assert(result != null);
            })
        })
    });
});

function deleteKeysFile() {
    const path = "./keys"
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            fs.unlinkSync(path + "/" + file)
        })
        fs.rmdirSync(path)
    }
}