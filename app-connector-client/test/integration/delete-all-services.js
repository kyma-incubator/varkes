var serviceResource = require("../../server/resources/api");
var CONFIG = require("../../config")
const fs = require("fs")
const path = require("path")




CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
serviceResource.getServices(false, (services) => {

    JSON.parse(services).forEach(element => {

        console.log("deleting ", element.id)
        serviceResource.deleteService(element.id, (data) => {
            console.log("deleted ", element.id)
        })
    });
})