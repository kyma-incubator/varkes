<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logo.svg" width="235">
</p>

# App Connector Client
[![npm version](https://badge.fury.io/js/varkes-app-connector-client.svg)](https://badge.fury.io/js/varkes-app-connector-client)

App Connector Client provides an interface to pair your application with Kyma and register it's APIs.

After startup, you have access to:
- UI - http://localhost:10000
- rest API - http://localhost:10000/metadata
- console - http://localhost:10000/console

## Starting the application

### Run local

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

### Run in Kyma

To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

and to deploy the mock
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/app-connector-client/deployment/deployment.yaml
```

## Running
- navigate to this folder.
- `npm install`
- `npm start`
- After first start, this repo will generate a private key for you and save it in keys folder. **Don't change the location of the keys folder.**
- Visit *localhost:10000* to open the UI and enter your TokenURL to the input field.
- Once you give your tokenURL, the system won't ask you again for your TokenURL. If you want to start the whole process again, delete the *keys* folder and run `npm start` again.

### Command line
Use `node cli.js` to run command line utility.

- To see help -> `node cli.js -h`
- A test command looks something like this: `node cli.js --input test/integration/basic-service-metadata.json --token https://connector-service.<CLUSTER_NAME>.cluster.kyma.cx/v1/remoteenvironments/hmc-default/info?token=rngXbjLra4EEjwXcwayTohiv83jkxmvrC4bA49RcRKnC8_70ighPopcWUCq5IEwp51aHXKBW5NLRadjOzJAWrQ==`

## Docs
You can access OpenAPI doc of this project either from *localhost:10000/metadata* or from *swagger.yaml* file.

## Testing
- To run tests on a Kyma, you need to give token url as environment variable. Set `TOKENURL` to kyma token.
- Once you set the token, run `npm test` to test the project.


## Logs
- Server logs will be in the file `server.log`
- Test logs will be in the file `test.log`
