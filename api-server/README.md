<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo.svg" width="150">
</p>

# Api Server
[![npm version](https://badge.fury.io/js/%40varkes%2Fapp-connector-client.svg)](https://badge.fury.io/js/%40varkes%2Fapi-server)

Api Server provides an interface to pair your application with Kyma, register APIs and send Events.

After the startup, you have access to:

- UI - `http://localhost:10000`
- rest API - `http://localhost:10000/metadata`
- console -`http://localhost:10000/console`

## Development

Make sure you have first executed `make resolve` from the project root!

To run the Server locally with an empty configuration, use:
```
npm start
```
To run it locally with debug logs enabled and an example configuration from the test suite, use:

```
npm run start:dev
```

## Documentation
You can access OpenAPI documentation using `localhost:10000/metadata` or the [api.yaml](server/resources/api.yaml) file.
