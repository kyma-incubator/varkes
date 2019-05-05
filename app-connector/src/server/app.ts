import * as connection from './connection';
import { Event } from './event';
import { API } from './api';

let api = new API();

let event = new Event();
var runasync = async () => {
    let all = await api.findAll();
}
runasync()
export { api, event, connection };