OpenAPI Mock
============================
#### Mocks res calls given an OpenAPI specification 


Features
---------------------------

- **Supports Swagger 2.0 specs in JSON or YAML** <br>
OpenAPI Mock uses [Swagger-Express-Middleware](https://github.com/BigstickCarpet/swagger-express-middleware) to parse, validate, and dereference Swagger files.  You can also create your custom implementation for a response and for errors.

- **Records Every Request made to the node** <br>
Creates a requests.log file that contains the urls being called, the header of the request and the body of the request if exists using the [morgan](https://www.npmjs.com/package/morgan) logging framework.

- **Returns the OpenAPI specification as metadata** <br>
By calling '/metadata' user can see the OpenAPI specification being use in text/x-yaml format

- **Returns a dummy OAuth2 token** <br>
By calling the base url '/authorizationserver/oauth/token' and adding the OAuth2 requirements as query params user can get a dummy OAuth2 token

Installation and Use
--------------------------
Install using [NPM](https://docs.npmjs.com/getting-started/what-is-npm).

````bash
npm install
````
Then you need to copy your OpenAPI yaml into the api/swagger directory as [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/swagger/swagger.yaml)<br>
OR you could simply change the path in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/config.js) file specified by the "specification_file" element

You need to remove the host, schemes and basePath keys in order for swagger-express-middleware to do it's magic
<br>
You don't need to write a custom response in your javascript code for every endpoint in the file,
for the endpoints that your are satisfied with a default response you add the default key with the response object to your response of the endpoint in the file as shown

````yaml
responses:
        200:
          description: "OK"
          schema:
            course:
              code:
                type: "string"
              name:
                type: "string"
            default:
              course:
                code: "C1"
                name: "course1"
````

Node js code
--------------------------

The entry point for the application is the app.js file which reads the swagger file [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/swagger/swagger.yaml) and creates an instance of the [mock_controller](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/mocks/mock_controller.js) where the user  

- **Write their custom code for handling some of the responses and registering them to the express app in the registerCustomResponses function.** <br>
        The following is an example of listening to the oauth post endpoint and replacing the body with a user defined token
````javascript
 app.post(Oauth_endpoint_key, function (req, res, next) {

            console.log("entered oauth");
            console.log(req.body)
            res.send({ token: 3333 })
        });
````
- **Add a some extra items to the default response** <br>
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
````
- **Return custom Error messages as response to certain error codes or messages in the customErrorResponses function** <br>
        the following example checks if the error status is not known or if it's one of the status that are defined in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/config.js) file and in response sends the corresponding error message

````javascript
 app = app_modified;
app.use(function (err, req, res, next) {
    console.log("error status")
    console.log(err.status)
    if (!err.status) {
        err.status = 500;
    }
    try {
        res.status(err.status);
        res.type('json');
        res.send(util.format(config.error_messages[err.status]));
    }
    catch (err) {
        console.error(err)
    }
});
````
[Config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/config.js)
--------------------------
In this file you define the paths of all the important files like the [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/swagger/swagger.yaml) file and the requests.log file.You can also add any kind of global element needed for the application. You also define all the custom error messages corresponding to their status code as following

````javascript
module.exports = {
    specification_file: 'api/swagger/swagger.yaml',
    request_log_path: 'requests.log',
    OAuth_template_path: 'api/swagger/OAuth_template.yaml',
    error_messages: {
        500: '{error:\"Something went Wrong\"}',
        400: '{error:\"Errorrrr\"}',
        404: '{error:\"End Point not found\"}'
    }
}
````

 Starting the application
--------------------------
There are two ways to start the application.
<br/>
- **start it as a node using npm command as follows:** <br>
Go to the directory of the examples application [openapi-mock-app](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app)
and Run the MakeLists.txt
````bash
make build -f MakeLists.txt
````

- **start it as a docker image as follows:** <br>

Go to the directory of the application and write in the terminal
````bash
docker build -t <tag_name> .
docker run -p <chosen_ip>:10000 <tag_name>
````