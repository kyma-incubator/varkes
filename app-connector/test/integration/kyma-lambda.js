const request = require('request');

module.exports = {
    'main': rq
};


function rq(event, context) {
    return new Promise((resolve, reject) => {
        console.log("Starting calculate-promotion lambda function")


    //const  url= "https://jsonplaceholder.typicode.com/todos";
    const url=`${process.env.GATEWAY_URL}`
        const options = {
            url: url,
            json: true
        };

        calculatePromotion(options, resolve, reject);

    })
}
function calculatePromotion(options, resolve, reject) {
    request.get(options, (error, response, body) => {
        if (!error) {
            if (response.statusCode == 200) {
                console.log('Getting orders from EC succeeded.');
                console.log(body)
                resolve(body);
            }
            else {
                reject({
                    stack: `Getting orders returned unexpected status: ${response.statusCode}.`
                })
            }
        } else {
            reject({
                stack: "Failed to get orders."
            })
        }
    })
}

rq({}, {}).then((data) => { console.log(data) })

/**
*  kyma dependencies
{
  "name": "app",
  "version": "0.0.1",
  "dependencies": {
    "request": "^2.85.0"
  }
}

*
*/
