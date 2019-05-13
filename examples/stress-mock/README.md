<p align="center">
 <img src="../../logos/logo.svg" width="150">
</p>

# stress-mock example

This example is to test the application-mock capability of registering over 300 apis to kyma, kyma ability to handle that many request and the ability of the openapi-mock and odata-mock serve these apis.

At startup the mock will generate a varkes_config.json file and place it to the `./generated` folder. It will generate 100 entries each for OpenAPI, OData and Event APIs using one sample specification loaced in `apis` directory.

The count of APIs can be adjusted via environment variables having these names:

- `OPENAPI` - amount of OpenAPI based APIs to register
- `ODATA`- amount of OData based APIs to register
- `EVENT`- amount of AsyncAPI based APIs to register

## Run local

To run it local run:
```
npm install
npm start
```

Navigate to `http://localhost:10000` to see the UI of the `cockpit`.
Navigate to `http://localhost:10000/console` to see the console of the `api-server`.
Navigate to `http://localhost:10000/api[154,155,...,303]/console` to see the console of the `courses` api.
Navigate to `http://localhost:10000/api[3,..,152]/console` to see the console of the `schools` api.

## Run local using docker

To run it using docker, call:
```
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/varkes-example-stress-mock:latest
```

## Run in Kyma

To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

and to deploy the mock
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/examples/stress-mock/deployment/deployment.yaml
```
