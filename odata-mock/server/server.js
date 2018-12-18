'use strict';
var loopback = require('loopback');
var utility = require("../common/utility/utility");
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var loopbackConfig = require('./config.json');
var parser = require(loopbackConfig.parserPath)
var app = loopback();
app.use(bodyParser.json());
let server;
let port;

app.startApp = function () {
  server = app.listen(port, function () {
    app.startLoopback();
  })
}
app.startLoopback = function () {
  // start the web server
  var baseUrl = app.get('url').replace(/\/$/, '');
  console.log('Web server listening at: %s', baseUrl);
  if (app.get('loopback-component-explorer')) {
    var explorerPath = app.get('loopback-component-explorer').mountPath;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  }
};

app.stop = () => {
  server.close();
}
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

parser.parser();

module.exports = function (configFilePath, portLocal) {
  var config = require(configFilePath);
  app.config = config;
  port = portLocal;
  var datasource = utility.readFile(__dirname + "/datasources.json");
  var datasourceJson = JSON.parse(datasource);
  datasourceJson.db.file = config.storage_file_path;
  utility.writeFileSync(__dirname + "/datasources.json", JSON.stringify(datasourceJson));
  loopbackConfig.port = config.port;
  var filePaths = [];
  for (var i = 0; i < config.apis.length; i++) {
    filePaths.push(parser.parseEdmx(config.apis[i].specification_file));
  }
  Promise.all(filePaths).then(function (result) {
    boot(app, __dirname, function (err) {
      if (err) throw err;

      app.startApp();
    });
  });
  return app;
}
if (process.argv.length > 2) {
  app = module.exports(process.argv[2]);
  //app.start();
}
