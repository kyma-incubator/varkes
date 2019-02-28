#!/usr/bin/env node
'use strict'

module.exports = function enableAuthentication(server) {
  server.enableAuth();
}
