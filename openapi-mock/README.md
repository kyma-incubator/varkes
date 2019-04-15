<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo.svg" width="150">
</p>

# OpenAPI Mock
[![npm version](https://badge.fury.io/js/%40varkes%2Fopenapi-mock.svg)](https://badge.fury.io/js/%40varkes%2Fopenapi-mock)

The OpenAPI mock mocks the application APIs based on the OpenAPI specification.

## Features

The OpenAPI mock brings you the following features:

- OpenAPI Mock uses [Swagger-Express-Middleware](https://github.com/BigstickCarpet/swagger-express-middleware) to parse, validate, and dereference OpenAPI files.  You can also create your custom implementation for responses or errors. See [this document](https://github.com/APIDevTools/swagger-express-middleware/blob/master/docs/middleware/mock.md) to learn how the API mock reacts to incoming requests.

- Records every request made to the node: The mock uses [morgan](https://www.npmjs.com/package/morgan)logging framework to create  a `requests.log` file. This file contains the called URLs, the request header, and the request body if exists.

- Returns the OpenAPI specification as metadata: Call '/metadata' to see the OpenAPI specification in `text` or `x-yaml` format.



## Development

Make sure you have first executed `make resolve` from the project root!

To run the OpenAPI mock locally, use an empty configuration:
```
npm start
```
To run it locally with debug logs enabled, and an example configuration from the test suite, run:

```
npm run start:dev
```

After the startup, you have access to:

- rest API - `http://localhost:10000/myApiBasePath/metadata`
- console - `http://localhost:10000/myApiBasePath/console`




