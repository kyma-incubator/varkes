<p align="center">
 <img src="./logos/logo.svg" width="235">
</p>

# Varkes
[![Build status](https://status.build.kyma-project.io/badge.svg?jobs=post-master-varkes)](https://status.build.kyma-project.io/?repo=kyma-incubator%2Fvarkes&job=post-master-varkes)

## Overview

Varkes (Greek for “small boats”) is a framework which mocks applications. This "small boat" allows you to mock even a complex application (a "big ship") and develop your functionality in an easy way. Instead of setting up and deploying the application, you simply pair the mock with Kyma to develop and experiment with it. When you are done, simply switch the "ships" to work with the actual application, and you are ready to go.


Varkes framework provides the following node modules to make the application mocks work:

* **Application Connector Client** used to pair with the Kyma cluster to register Events and APIs and send Events. For details, see [Application Connector Client](app-connector-client/README.md).

* **OpenAPI mock** which mocks the application APIs based on the OpenAPI specification. For details, see [OpenAPI mock](openapi-mock/README.md).

* **Odata mock** which mocks the application APIs based on the OData specification. For details, see [OData mock](odata-mock/README.md).

## Architecture

The diagram shows how an application mock integrates with a Kyma cluster and which functionality is taken over by which framework modules:

![Mocks Architecture](/assets/mocks-architecture.svg)

## Examples

The `examples` folder includes mocks based on OpenAPI and OData packages. 
>**NOTE:** Using examples in the `master` branch without cloning the whole repository is currently impossible because they use development version numbers in their `package.json` files and these are not published to npm registry. If you want to use them without cloning the whole repository, refer to tags in the `release` branch. There, you can find the latest version of the dependencies already included in their `package.json` files. 

To create Docker images of examples, see the `release` branch, where npm installed in Docker containers can get the latest version from the registry.

## Development

This project is maintained by Lerna. To start developing perform these steps:

1. If you don't have lerna, install it by running `npm install -g lerna`.
2. Clone this repo and run `lerna bootstrap --hoist` to install dependencies and link local dependencies.
3. Introduce your changes and commit freely. There is no need to update the package versions in dependent subprojects.

To increase the version number, run `lerna version --no-git-tag-version`, stating the new version number. When omitting the flag, it also creates a new git tag with the given version number. This command also updates the dependency version in the `package.json` of subprojects.

To see how CI operates on Lerna, check the makefile in the root folder.
