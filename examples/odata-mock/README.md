<p align="center">
 <img src="../../assets/logo.svg" width="150">
</p>

# odata-mock example

This example illustrate how to use the `varkes-odata-mock` standalone.

## Run local

To run it local run:

```bash
npm install
npm start
```

Navigate to `http://localhost:10000/api/odata/console` to see the console

Navigate to `http://localhost:10000/odata/` to browse odata API

## Run local using docker

To run it using docker, call:

```bash
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/varkes-example-odata-mock:latest
```

## Run in Kubernetes

To run the mock using Kubernetes as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
```

and to deploy the mock

```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/examples/odata-mock/deployment/deployment.yaml
```
