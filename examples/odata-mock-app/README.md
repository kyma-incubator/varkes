<!-- - **Writing custom code for handling some of the responses and registering them to the express app [routes.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/server/boot/routes.js).** <br>
        The following is an example of listening to the get endpoint "'/authorizationserver/oauth/" checking if the required parameters are submitted, then returning the redirect_uri enetred as a query parameter and adding to it the token
````javascript
app.get('/authorizationserver/oauth/*', function (req, res, next) {
        if (req.query.response_type && req.query.scope) {
            if (req.query.redirect_uri) {
                res.status(200)
                res.send(req.query.redirect_uri + "#token=7777");
            }
            else
                res.send('Please, enter redirected_uri');
        }
        else {
            res.status(404)
            res.send('Wrong parameters');
        }

    });
````
- **Add a some extra items to the default response** <br>
        The following is an example of changing the error message in the response depending on the status code
````javascript
 function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {
            // arguments[0] (or `data`) contains the response body
            if (arguments[0].statusCode == 401) {
                arguments[0] = "401 Entity does not exist";
            }
            else if (arguments[0].statusCode == 404) {
                arguments[0] = "404 Bad URL";
            }
            oldSend.apply(res, arguments);
        }
        next();
    }
```` -->