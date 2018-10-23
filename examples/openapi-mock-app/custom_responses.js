var Oauth_endpoint_key = "/authorizationserver/oauth/token";
module.exports = {

    customResponses: function (app) {
        app.post("*" + Oauth_endpoint_key, function (req, res, next) {

            console.log(req.body)
            res.send({ token: 3333 })
        });

        app.get('/entity/courses', function (req, res, next) {

            var oldSend = res.send;
            res.send = function (data) {
                console.log(data);
                data = JSON.parse(data);
                data.courses.push({ code: "C3", name: "course3" })
                arguments[0] = JSON.stringify(data);
                oldSend.apply(res, arguments);
            }
            next();
        });
    }
}