import * as connection from './connection';
import { Event } from './event';
import { API } from './api';
import { logger as lg } from "@varkes/config-validator"
const LOGGER: any = lg.init("app-connector")
connection.init();
let api = new API();
let event = new Event();
export { api, event, connection, LOGGER };