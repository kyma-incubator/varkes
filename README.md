<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logo.svg" width="235">
</p>

# Varkes
[![Build status](https://status.build.kyma-project.io/badge.svg?jobs=post-master-varkes)](https://status.build.kyma-project.io/?repo=kyma-incubator%2Fvarkes&job=post-master-varkes)

*Varkes* means small boats in contrast to the big ships. We are building a framework/toolkit of components, which then mock the big ships (applications). The aim is to give a framework to application writers that can mock their application so that they can experiment on Kyma functions without thinking about the deployment of their applications. Once they have the required logic they want from Kyma, they can deploy their applications without any change on Kyma side.
## App Connector Client
App connector has a REST api that is used to get certificate from kyma cluster. You can run it with `npm start` or you can use the *Dockerfile* to create a docker image. Further instructions are in [app-connector-client/README.md](app-connector-client/README.md).

## OpenAPI Mock
Mocks REST calls given an OpenAPI specification. [openapi-mock/README.md](openapi-mock/README.md).

## Odata Mock
Mocks rest calls given an OData specification [odata-mock/README.md](odata-mock/README.md).

## Examples
Examples folder provides mocks written using openapi & odata packages. If you want to use them without cloning the whole repo, please refer to tags in `release` branch. There, you can find the latest version of the dependencies already included in their package.json files. Working on examples in master branch without cloning the whole repo is currently impossible because they use development version numbers in their package.jsons and these are not published to npm registry.

To create docker images of examples, please also refer to `release` branch, where npm installed in docker containers can get the latest version from the registry.

## Developing
This project is maintained by Lerna. To start developing, clone this repo and run `lerna bootstrap --hoist` to install dependencies and link local dependencies.

> If you don't have lerna, you can install it with `npm install -g lerna`

After that step, you can make your changes and commit freely. There is no need to update the package versions in dependent subprojects.

To increase version number, run `lerna version --no-git-tag-version`. It asks user the new version number. When omitting the flag, it also creates a new git tag with the given version number. This command also updates the dependency version in the `package.json` of subprojects.

To see how CI operates on Lerna, check the makefile in the root folder.
