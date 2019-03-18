<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# App Connector Client
[![npm version](https://badge.fury.io/js/varkes-app-connector-client.svg)](https://badge.fury.io/js/varkes-app-connector-client)

App Connector Client provides an interface to pair your application with Kyma, register APIs and send Events.

After startup, you have access to:
- UI - http://localhost:10000
- rest API - http://localhost:10000/metadata
- console - http://localhost:10000/console

## Development

To run the Client locally, use an empty configuration:
```
npm install

```
To run it locally with debug logs enabled, and an example configuration from the test suite, run:

```
npm run start:dev

```

After startup, you have access to:
- UI - `http://localhost:10000`
- rest API - `http://localhost:10000/metadata`
- console - `http://localhost:10000/console`


## Documentation
You can access OpenAPI documentation using `localhost:10000/metadata` or the [api.yaml](server/resources/api.yaml) file.


