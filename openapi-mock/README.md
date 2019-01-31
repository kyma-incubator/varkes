# OpenAPI Mock

Mocks res calls given an OpenAPI specification 

After startup, you have access to:
- rest API - http://localhost:10000/myApiBasePath/metadata
- console - http://localhost:10000/myApiBasePath/console

## Starting the application

### Run local

To run it local, specify a config file (as located in the /test folder) like that:
```
npm install
node server/server <varkes_config.js>
```

### Run local using docker

To run it using docker, call:
```
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/develop/varkes-openapi-mock:latest
```

### Run in Kyma

To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

and to deploy the mock
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/openapi-mock/deployment/deployment.yaml
```

## Features

- **Supports OpenAPI 3.0 specs in JSON or YAML** <br>
OpenAPI Mock uses [Swagger-Express-Middleware](https://github.com/BigstickCarpet/swagger-express-middleware) to parse, validate, and dereference OpenAPI files.  You can also create your custom implementation for a response and for errors.

- **Records Every Request made to the node** <br>
Creates a requests.log file that contains the urls being called, the header of the request and the body of the request if exists using the [morgan](https://www.npmjs.com/package/morgan) logging framework.

- **Returns the OpenAPI specification as metadata** <br>
By calling '/metadata' user can see the OpenAPI specification being use in text/x-yaml format

- **Returns a dummy OAuth2 token** <br>
By calling the endpoint '/authorizationserver/oauth/token' and adding the OAuth2 requirements as query params user can get a dummy OAuth2 token

## Installation and Use

Install using [NPM](https://docs.npmjs.com/getting-started/what-is-npm).

````bash
npm install
````
Then you need to copy your OpenAPI yaml into the api/swagger directory as [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/swagger.yaml)<br>
OR you could simply change the path in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/config.js) file specified by the "specification" element

You need to remove the host in order for swagger-express-middleware to do it's magic
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
The entry point for the application is the app.js file which reads the swagger file [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/swagger.yaml) and creates an instance of the [mock_controller](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-app/api/mocks/mock_controller.js) where the user  

- **Return custom Error messages as response to certain error codes or messages in the customErrorResponses function** <br>
        the following example checks if the error status is not known or if it's one of the status that are defined in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/openapi-mock/test/config.js) file and in response sends the corresponding error message

````javascript
 app = app_modified;
app.use(function (err, req, res, next) {
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
[Config.js](https://github.com/kyma-incubator/varkes/blob/master/openapi-mock/test/config.js)
--------------------------
In this file you define the paths of all the important files like the [swagger.yml](https://github.com/kyma-incubator/varkes/blob/master/openapi-mock/swagger.yaml) file and the requests.log file.You can also add any kind of global element needed for the application. You also define all the custom error messages corresponding to their status code as following

````javascript
module.exports = {
    specification: 'swagger.yaml',
    request_log_path: 'requests.log',
    added_endpoints: [
        {
            filePath: "OAuth_template.yaml",
            url: '/authorizationserver/oauth/token'
        }
    ],
    customResponsePath: '../../custom_responses',
    error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        400: '{"error":\"Errorrrr\"}',
        404: '{"error":\"End Point not found\"}'
    },
    port: 10000
}
````