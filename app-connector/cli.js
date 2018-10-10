const program = require("commander")
const request = require("request")
const readline = require("readline")
const connector = require("./server/connector")
const fs = require("fs")
var CONFIG = require("./config")
const path = require("path")
console.log("CLI for Varkes App Connector")


program
    .version("0.0.1")
    .option('-token, --token [tokenUrl]', "connect token for RE", '')
    .option('--input [inputFile]', "file to register with app-connector", '')
    .parse(process.argv)


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let keyFile, certFile
if (!fs.existsSync(path.resolve(CONFIG.keyDir, "ec-default.key"))) {
    console.log("generating new key")
    require("./prestart").generatePrivateKey(data => console.log(data))
}
getInputFile(rl, program).then(inputFile => {

    const serviceMetadata = path.resolve(inputFile)
    console.log(serviceMetadata)

    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        CONFIG.URLs = JSON.parse(fs.readFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile)))
        console.log("keys exist")
        keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
            , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')

        createServiceFromFile(JSON.parse(fs.readFileSync(serviceMetadata)))

    } else {
        getTokenUrl(rl, program).then(tokenUrl => {

            createKeysFromToken(tokenUrl, urls => {
                fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(urls), "utf8")

                CONFIG.URLs = urls
                console.log(urls)
                keyFile = path.resolve(CONFIG.keyDir, 'ec-default.key')
                    , certFile = path.resolve(CONFIG.keyDir, 'kyma.crt')
                createServiceFromFile(JSON.parse(fs.readFileSync(serviceMetadata)))

            })

        })
    }

})

function createKeysFromToken(tokenUrl, cb) {
    connector.exportKeys(tokenUrl, (data) => cb(data))
}
function createServiceFromFile(serviceMetadata) {
    console.log(serviceMetadata)
    console.log(certFile)
    console.log(keyFile)
    request.post({
        url: CONFIG.URLs.metadataUrl,
        headers: {
            "Content-Type": "application/json"
        },
        json: serviceMetadata,
        agentOptions: {
            cert: fs.readFileSync(certFile),
            key: fs.readFileSync(keyFile)
        }
    }, function (error, httpResponse, body) {
        console.log(body)
        rl.close()
    });
}

function getTokenUrl(rl, program) {

    return new Promise((resolve, reject) => {
        if (program.token === '') {

            rl.question("Please enter your connection token: ", (answer) => {

                resolve(answer)


            })
        } else { resolve(program.token) }
    })
}


function getInputFile(rl, program) {

    return new Promise((resolve, reject) => {
        if (program.input == '') {
            rl.question("Please enter your input file: ", (answer) => {

                resolve(answer)

            })
        } else { resolve(program.input) }
    })

}
