var request = require("request")


request.post(
    "http://127.0.0.1:8080/v1/remoteenvironments/hmc-default/tokens",
    (error, response, body) => {
        resp = JSON.parse(body)
        console.log(body)
        request.post(
            "http://127.0.0.1:3000/startConn",
            { json: resp },
            (error, response, data) => {
                console.log(data)
            }
        )
    });