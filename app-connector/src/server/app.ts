import * as connection from './connection';
import { Event } from './event';
import { API } from './api';
import * as path from 'path';
import * as fs from 'fs';
const updatedSchoolsAPI = fs.readFileSync(path.resolve("dist/test/updatedSchools.json")).toString();
connection.init();
let api = new API();

let event = new Event();
var runsync = async () => {
    let all: any = await api.findAll();
    console.log("all " + all);
    let updatedapi = await api.update(JSON.parse(updatedSchoolsAPI), JSON.parse(all)[0].id);
    console.log("api " + JSON.stringify(updatedapi));
}
runsync()
export { api, event, connection };