<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# OpenAPI Mock
[![npm version](https://badge.fury.io/js/varkes-openapi-mock.svg)](https://badge.fury.io/js/varkes-openapi-mock)

The OpenAPI mock mocks the application APIs based on the OpenAPI specification.

## Features

The OpenAPI mock brings you the following features:

- Supports OpenAPI 3.0 specs in json or yaml: OpenAPI Mock uses [Swagger-Express-Middleware](https://github.com/BigstickCarpet/swagger-express-middleware) to parse, validate, and dereference OpenAPI files.  You can also create your custom implementation for responses or errors.

- Records every request made to the node: It uses [morgan](https://www.npmjs.com/package/morgan)logging framework to create  a `requests.log` file that contains the called URLs, the request header, and the request body if exists.

- Returns the OpenAPI specification as metadata: By calling '/metadata' you can see the OpenAPI specification in text or x-yaml format.

- Returns a dummy OAuth2 token: By calling the '/authorizationserver/oauth/token' endpoint and adding the OAuth2 requirements as query parameters you can get a dummy OAuth2 token

## Installation

1. Install the mock by running the following [npm](https://docs.npmjs.com/getting-started/what-is-npm) command:

````bash
npm install
````
2. Copy your OpenAPI `yaml` file to the [`apis`](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-mock/apis) directory. Alternatively, change the path for the `specification` element in the [varkes_config.json](https://github.com/kyma-incubator/varkes/blob/master/examples/openapi-mock/varkes_config.json) file o point to the directory where your file resides.

3. Remove the host from your file for `swagger-express-middleware` to work properly.

## Run mock

### Run locally

To run the application locally, specify a config file (as located in the `/test` folder):
```
npm install
node server/server <varkes_config.json>
```

### Run local using Docker

To run the application using Docker use the following command:
```
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/develop/varkes-openapi-mock:latest
```

### Run in Kyma

1. To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a Namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

2. Deploy the mock:
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/openapi-mock/deployment/deployment.yaml
```


After the startup, you have access to:
- rest API - http://localhost:10000/myApiBasePath/metadata
- console - http://localhost:10000/myApiBasePath/console






