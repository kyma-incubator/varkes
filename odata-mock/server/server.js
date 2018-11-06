'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var loopbackConfig = require('./config.json');
var parser = require(loopbackConfig.parserPath)
var app = loopback();
app.use(bodyParser.json());
let server;



app.start = function () {
  // start the web server

  return app.listen(function () {
    app.emit('started');

    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }

  });
};

app.stop = () => {
  server.close();
}
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

parser.parser();

module.exports = function (configFilePath) {
  var config = require(configFilePath);
  app.config = config;
  loopbackConfig.port = config.port;
  parser.parseEdmx(config.specification_file).then(function (result) {
    boot(app, __dirname, function (err) {
      if (err) throw err;

      // start the server if `$ node server.js`
      if (require.main === module)
        server = app.start();
    });
  });
  return app;
}
if (process.argv.length > 2)
  module.exports(process.argv[2]);