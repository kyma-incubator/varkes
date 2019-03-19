<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# odata-mock example

This example illustrate how to use the `varkes-odata-mock` standalone.

## Run local

To run it local run:
```
npm install
npm start
```

Navigate to `http://localhost:10000/api/console` to see the console

Navigate to `http://localhost:10000/odata/` to browse odata API

## Run local using docker

To run it using docker, call:
```
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/varkes-example-odata-mock:latest
```

## Run in Kyma

To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

and to deploy the mock
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/examples/odata-mock/deployment/deployment.yaml
```