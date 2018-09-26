var request = require("request")



require.main === module ? getToken(data => console.log(data)) : console.log("required")

function getToken(cb) {

    if (process.env.TOKENURL) {
        console.log("token given from env")
        cb(process.env.TOKENURL)
    }
    else {
        request.post(
            "http://127.0.0.1:8080/v1/remoteenvironments/hmc-default/tokens",
            (error, response, body) => {
                try {
                    resp = JSON.parse(body)

                    cb(resp.url)
                } catch (e) {
                    console.log("couldn't get token")
                    cb(undefined)
                }
            });
    }
}

module.exports = {
    getToken: getToken
}