import * as connection from './connection';
import { Event } from './event';
import { API } from './api';
connection.init();
let api = new API();
let event = new Event();
module.exports = { api, event, connection };