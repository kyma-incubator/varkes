var request = require("request")


request.post(
    "http://127.0.0.1:8080/v1/remoteenvironments/hmc-default/tokens",
    (error, response, body) => {
        resp = JSON.parse(body)
        console.log(JSON.parse(body).url)

    });