# Harmonia
*Harmonia* means "Harmony" in greek. This project aims to ensure harmony between Kyma and third party services before they are even deployed. To provide this *harmony* as easy as possible, Harmonia currently offers number of tools to create a mock of different api endpoints and events.

## App Connector
App connector has a REST api that is used to get certificate from kyma cluster. You can run it with `npm start` or you can use the *Dockerfile* to create a docker image. Further instructions are in [app-connector/Readme.md](app-connector/Readme.md)