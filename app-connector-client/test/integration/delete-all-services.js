var apis = require("../../server/api");
var CONFIG = require("../../config")
const fs = require("fs")
const path = require("path")

CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
console.log("deleting services")
apis.deleteAPIs( (data,err) => {
    console.log("deleted services")
})