var odata = require('n-odata-server/lib/odata');

module.exports = function (loopbackApplication: any, options: any) {
  odata.init(loopbackApplication, options);
  odata.OData.singletonInstance = null
}