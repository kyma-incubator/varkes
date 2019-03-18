<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# OpenAPI Mock
[![npm version](https://badge.fury.io/js/varkes-openapi-mock.svg)](https://badge.fury.io/js/varkes-openapi-mock)

The OpenAPI mock mocks the application APIs based on the OpenAPI specification.

## Features

The OpenAPI mock brings you the following features:

- OpenAPI Mock uses [Swagger-Express-Middleware](https://github.com/BigstickCarpet/swagger-express-middleware) to parse, validate, and dereference OpenAPI files.  You can also create your custom implementation for responses or errors.

- Records every request made to the node: The mock uses [morgan](https://www.npmjs.com/package/morgan)logging framework to create  a `requests.log` file. This file contains the called URLs, the request header, and the request body if exists.

- Returns the OpenAPI specification as metadata: By calling '/metadata' you can see the OpenAPI specification in `text` or `x-yaml` format.

- Returns a dummy OAuth2 token: By calling the '/authorizationserver/oauth/token' endpoint and adding the OAuth2 requirements as query parameters you can get a dummy OAuth2 token.


## Run mock


To run the mock locally, specify the [varkes config](https://github.com/kyma-incubator/varkes/blob/master/openapi-mock/test/varkes_config.json) file:
```
npm install
node server/server <varkes_config.json>
```




