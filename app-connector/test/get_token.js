var request = require("request")


request.post(
    "http://localhost:8080/v1/remoteenvironments/hmc-default/tokens",
    (error, response, body) => {
        resp = JSON.parse(body)

        request.post(
            "http://localhost:3000/startConn",
            { json: resp },
            (error, response, data) => {
                console.log(data)
            }
        )
    });