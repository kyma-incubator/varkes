//Api definitions of this file is taken from https://raw.githubusercontent.com/kyma-project/kyma/master/docs/application-connector/docs/assets/metadataapi.yaml

var request = require("request")
const remoteEnvironmentName = "ec-default"
const fs = require("fs")
const path = require("path")

var keyFile = path.resolve(__dirname, '../keys/ec-default.key')
    , certFile = path.resolve(__dirname, '../keys/kyma.crt')
    , serviceMetadata = path.resolve(__dirname, "assets/basic-service-metadata.json")

function deployService() {
    console.log(keyFile)
    request.post({
        url: `https://gateway.beta-on-prem.cluster.kyma.cx/${remoteEnvironmentName}/v1/metadata/services`,
        headers: {
            "Content-Type": "application/json"
        },
        body: fs.readFileSync(serviceMetadata),
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {
        console.log(error)
        console.log(body)
    });
}

function deleteService(serviceID) {
    request.delete(
        {
            url: `https://gateway.beta-on-prem.cluster.kyma.cx/${remoteEnvironmentName}/v1/metadata/services/${serviceID}`,
            agentOptions: {
                cert: fs.readFileSync(certFile),
                key: fs.readFileSync(keyFile)
            },
        }, function (error, httpResponse, body) {
            console.log(`${serviceID} deleted`)
        }
    )
}

function getServices() {
    request.get({
        url: `https://gateway.beta-on-prem.cluster.kyma.cx/${remoteEnvironmentName}/v1/metadata/services`,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        },
    }, function (error, httpResponse, body) {
        console.log(body)
    })
}


deployService()

//deleteService("dd0193fa-8fcb-41aa-8f54-244d79ab6c03")  // You can use this to clear environment
