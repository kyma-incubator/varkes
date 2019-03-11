# Varkes
[![Build status](https://status.build.kyma-project.io/badge.svg?jobs=post-master-varkes)](https://status.build.kyma-project.io/?repo=kyma-incubator%2Fvarkes&job=post-master-varkes)

*Varkes* means small boats in contrast to the big ships. We are building a framework/toolkit of components, which then mock the big ships (applications). The aim is to give a framework to application writers that can mock their application so that they can experiment on Kyma functions without thinking about the deployment of their applications. Once they have the required logic they want from Kyma, they can deploy their applications without any change on Kyma side.
## App Connector Client
App connector has a REST api that is used to get certificate from kyma cluster. You can run it with `npm start` or you can use the *Dockerfile* to create a docker image. Further instructions are in [app-connector-client/README.md](app-connector-client/README.md).

## OpenAPI Mock
Mocks REST calls given an OpenAPI specification. [openapi-mock/README.md](openapi-mock/README.md).

## Odata Mock
Mocks rest calls given an OData specification [odata-mock/README.md](odata-mock/README.md).

## Developing
This project is maintained by Lerna. To start developing, clone this repo and run `lerna bootstrap --hoist` to install dependencies and link local dependencies.

> If you don't have lerna, you can install it with `npm install -g lerna`

After that step, you can make your changes and commit freely. There is no need to update the package versions in dependent subprojects.

To increase version number, run `lerna version --no-git-tag-version`. It asks user the new version number. When omitting the flag, it also creates a new git tag with the given version number. This command also updates the dependency version in the `package.json` of subprojects.

To see how CI operates on Lerna, check the makefile in the root folder.

`lerna publish` automatically increases version number before publishing so we are using `npm publish` instead and just use lerna to run that command in projects. To test publishing scheme, you can use [verdaccio](https://github.com/verdaccio/verdaccio) for setting up a private registry.
