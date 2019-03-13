#!/usr/bin/env node
'use strict'

module.exports = function (server: any) {
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);
}
