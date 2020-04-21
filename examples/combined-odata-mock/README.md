<p align="center">
 <img src="../../assets/logo.svg" width="150">
</p>

# combined-openapi-mock example

This example illustrate how to use the `varkes-odata-mock` in combination with the `varkes-api-server`.

## Run local using npm

To run it local run:

```bash
npm install
npm start
```

Navigate to `http://localhost:10000` to see the UI of the `cockpit`.
Navigate to `http://localhost:10000/console` to see the console of the `api-server`.
Navigate to `http://localhost:10000/api/odata/northwind.svc/console` to see the console of the `northwind.svc`.
Navigate to `http://localhost:10000/odata/northwind.svc/` to see the basepath of the `northwind.svc` ODATA API.
Navigate to `http://localhost:10000/odata/northwind.svc/$metadata` to see the metadata of the `northwind.svc` ODATA API.

## Run local using docker

To run it using docker, call:

```bash
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/varkes-example-combined-odata-mock:latest
```

## Run in Kubernetes

To run the mock using Kubernetes as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
```

and to deploy the mock

```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/examples/combined-odata-mock/deployment/deployment.yaml
```
