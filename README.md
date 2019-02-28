# Varkes
*Varkes* means small boats in contrast to the big ships. We are building a framework/toolkit of components, which then mock the big ships (applications). The aim is to give a framework to application writers that can mock their application so that they can experiment on Kyma functions without thinking about the deployment of their applications. Once they have the required logic they want from Kyma, they can deploy their applications without any change on Kyma side.
## App Connector Client
App connector has a REST api that is used to get certificate from kyma cluster. You can run it with `npm start` or you can use the *Dockerfile* to create a docker image. Further instructions are in [app-connector-client/README.md](app-connector-client/README.md).

## OpenAPI Mock
Mocks REST calls given an OpenAPI specification. [openapi-mock/README.md](openapi-mock/README.md).

## Odata Mock
Mocks rest calls given an OData specification [odata-mock/README.md](odata-mock/README.md).

## Developing
This project is maintained by Lerna. To start developing , clone this repo and run `lerna bootstrap` to install dependencies and link local dependencies.

> If you don't have lerna, you can install it with `npm install -g lerna`

After that step, you can make your changes and commit freely. Versioning will be handled by CI.

To test the whole codebase, run `npm test` in root repository. Lerna will run tests one by one. For individual tests, go to respective project folder and run `npm test`.