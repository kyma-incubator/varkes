import * as connection from './connection';
import { Event } from './event';
import { API } from './api';
connection.init();
let api = new API();
let event = new Event();
export { api, event, connection };