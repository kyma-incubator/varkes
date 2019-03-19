# stress-mock example

This example is to test the application-mock capability of registering over 300 apis to kyma, kyma ability to handle that many request and the ability of the openapi-mock and odata-mock serve these apis.

## Run local

To run it local run:
```
npm install
npm start
```

Navigate to `http://localhost:10000` to see the UI of the `app-connector-client`.
Navigate to `http://localhost:10000/console` to see the console of the `app-connector-client`.
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