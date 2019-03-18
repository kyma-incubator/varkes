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

## Run mock

To run it local, specify the [varkes config](https://github.com/kyma-incubator/varkes/blob/master/app-connector-client/test/varkes_config.json) file:
```
npm install
node server/server <varkes_config.json>
```

After startup, you have access to:
- UI - `http://localhost:10000`
- rest API - `http://localhost:10000/metadata`
- console - `http://localhost:10000/console`


## Documentation
You can access OpenAPI documentation using `localhost:10000/metadata` or `swagger.yaml` file.

## Tests
- To run tests on a Kyma, provide the token URL as an environment variable. Set the `TOKENURL` to Kyma token.
- Once you set the token, run `npm test` to test the project.


