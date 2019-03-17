<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# App Connector Client
[![npm version](https://badge.fury.io/js/varkes-app-connector-client.svg)](https://badge.fury.io/js/varkes-app-connector-client)

App Connector Client provides an interface to pair your application with Kyma and register it's APIs.

After startup, you have access to:
- UI - http://localhost:10000
- rest API - http://localhost:10000/metadata
- console - http://localhost:10000/console

## Starting the application

### Run locally

To run it local, specify a config file (as located in the /test folder) like that:
```
npm install
node server/server <varkes_config.js>
```

### Run local using docker

To run it using docker, call:
```
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/develop/varkes-app-connector-client:latest
```


## Docs
You can access OpenAPI doc of this project either from *localhost:10000/metadata* or from *swagger.yaml* file.

## Testing
- To run tests on a Kyma, you need to give token url as environment variable. Set `TOKENURL` to kyma token.
- Once you set the token, run `npm test` to test the project.


