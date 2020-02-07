<p align="center">
 <img src="./assets/logo.svg" width="150">
</p>

# Varkes
[![Build status](https://status.build.kyma-project.io/badge.svg?jobs=post-master-varkes)](https://status.build.kyma-project.io/?repo=kyma-incubator%2Fvarkes&job=post-master-varkes)

## Overview

Varkes (Greek for “small boats”) is a framework which mocks applications. This "small boat" allows you to mock even a complex application (a "big ship") and develop your functionality in an easy way. Instead of setting up and deploying an often complex application, you simply pair the mock with Kyma to develop and experiment with it. When you are done, simply switch the "ships" to connect to and work with the target application. 

Varkes framework provides the following node modules to make the application mocks work:

* **API Server** serves an API to pair with a Kyma cluster to register Events and APIs and send Events. For details, see [API Server](modules/api-server/README.md).

* **App Connector** is a library used by the *API-Server* covering all communication to a Kyma cluster. For details, see [App Connector](modules/app-connector/README.md).

* **Cockpit** a UI of the *API server* for a convenient way of management. For details, see [Cockpit](modules/cockpit/README.md).

* **OpenAPI Mock** which mocks the application APIs based on the OpenAPI specification. For details, see [OpenAPI mock](modules/openapi-mock/README.md).

* **OData Mock** which mocks the application APIs based on the OData specification. For details, see [OData mock](modules/odata-mock/README.md).

* **Configuration** which manages loading and validation of Varkes configuration files, see [Configuration](modules/configuration/README.md).
  
## Architecture

The diagram shows how an application mock integrates with a Kyma cluster and which functionality is taken over by which framework modules:

![Mocks Architecture](/assets/architecture.svg)

## Examples & Usage

Use the modules as express middleware in your express based NodeJs application.
Depending on the modules you require, add the dependencies to your package.json like that:
```
  "dependencies": {
    "@varkes/configuration": "*",
    "@varkes/api-server": "*",
    "@varkes/odata-mock": "*",
    "@varkes/openapi-mock": "*",
    "@varkes/cockpit": "*"
  }
```

In your application enable the modules in your express app like that:
```
const config = require("@varkes/configuration")
const odataMock = require("@varkes/odata-mock")
const openapiMock = require("@varkes/openapi-mock")
const server = require("@varkes/api-server")
const cockpit = require("@varkes/cockpit")
const app = require('express')()

let configuration = await config.resolveFile("./varkes_config.json")
app.use(await odataMock.init(configuration))
app.use(await openapiMock.init(configuration))
app.use(await server.init(configuration))
app.use(await cockpit.init(configuration))

app.listen(10000, function () {
       console.info("Started application on port %d", 10000)
})
```

Furthermore a configuration is required, specified in the `./varkes_config.json` file. The simplest configuration is `{}`. For examples on configurations look at the examples in the `examples` folder. They include different mocks based on OpenAPI and OData packages.

A reference documentation on the configuration you can find at the [Type definition](modules/configuration/src/types.ts)

>**NOTE:** Using examples in the `master` branch without cloning the repository is currently impossible because of the development version numbers used in the `package.json` files which are not published to the npm registry. If you want to use the examples without cloning the whole repository, use the tags in the `release` branch. There you can find the latest version of the dependencies already included in the `package.json` files. 

## Development

This project is maintained with [Lerna](https://lerna.js.org/). To start developing perform these steps:

1. If you don't have lerna, install it by running `npm install -g lerna`.
2. Clone this repo and run `make resolve` in the project root to install dependencies and link local dependencies.
3. Introduce your changes and commit freely. There is no need to update the package versions in dependent subprojects.

To increase the version number, run `lerna version --no-git-tag-version`, stating the new version number. When omitting the flag, it also creates a new git tag with the given version number. This command also updates the dependency version in the `package.json` of subprojects.

To see how CI operates on Lerna, check the makefile in the root folder.

>**NOTE:** To create Docker images of examples, use the `release` branch, where the npm installed in Docker containers can get the latest version from the registry.
