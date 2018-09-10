# Varkes
*Varkes* means small boats in contrast to the big ships. We are building a framework/toolkit of components, which then mock the big ships (applications). The aim is to give a framework to application writers that can mock their application so that they can experiment on Kyma functions without thinking about the deployment of their applications. Once they have the required logic they want from Kyma, they can deploy their applications without any change on Kyma side.
## App Connector
App connector has a REST api that is used to get certificate from kyma cluster. You can run it with `npm start` or you can use the *Dockerfile* to create a docker image. Further instructions are in [app-connector/Readme.md](app-connector/Readme.md).

## OpenAPI Mock
Mocks REST calls given an OpenAPI specification. [OpenAPIMock/Readme.md](OpenAPIMock/Readme.md).