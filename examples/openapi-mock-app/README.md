<!-- - **Write their custom code for handling some of the responses and registering them to the express app in the registerCustomResponses function.** <br>
        The following is an example of listening to the oauth post endpoint and replacing the body with a user defined token
````javascript
 app.post(Oauth_endpoint_key, function (req, res, next) {

            console.log("entered oauth");
            console.log(req.body)
            res.send({ token: 3333 })
        });
```` -->
<!-- - **Add a some extra items to the default response** <br>
        The following is an example of listening to the get endpoint "/courses" which returns two items as response, "course1" and "course2", then adding a third item to the array by overwriting the send function for the response object "res"
````javascript
 app.get('/courses', function (req, res, next) {

            var oldSend = res.send;
            res.send = function (data) {
                data = JSON.parse(data);
                data.cardTypes.push({ code: "C3", name: "course3" })
                arguments[0] = JSON.stringify(data);
                oldSend.apply(res, arguments);
            }
            next();
        });
        
```` -->