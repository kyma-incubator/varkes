<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# OData Mock
[![npm version](https://badge.fury.io/js/varkes-odata-mock.svg)](https://badge.fury.io/js/varkes-odata-mock)

Mocks rest calls given an OData specification.

## Features

- **Supports OData edmx specification** <br>
Copy the edmx specification to the [EDMX_MODEL_SPECIFICATION.xml]((https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/EDMX_MODEL_SPECIFICATION.xml) file and the Engine will automatically create data model files for the entities specified in the specification

- **Records Every Request made to the node** <br>
Creates a requests.log file that contains the urls being called, the header of the request and the body of the request if exists using the [morgan](https://www.npmjs.com/package/morgan) logging framework.

- **Returns the OData specification as metadata** <br>
By calling `/odata/$metadata` user can see the OData edmx specification being use in xml format

- **Returns a dummy OAuth2 token** <br>
By posting to url `odata/authorizationserver/oauth/token` the OAuth2 requirements in the request body, user can get a dummy OAuth2 token

- **Based on the n-odata package** <br>
the odata-mock application is based on the [n-odata-server](https://github.com/htammen/n-odata-server) project, which is based on [loopback](https://loopback.io/) 

After startup, you have access to:
- odata API - http://localhost:10000/odata/
- odata metadata - http://localhost:10000/odata/$metadata
- rest API - http://localhost:10000/api/console

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
docker run -p 10000:10000 eu.gcr.io/kyma-project/incubator/develop/varkes-odata-mock:latest
```

### Run in Kyma

To run the mock using Kyma as runtime envrironment, run the following kubectl command to set up a namespace:

```bash
kubectl create namespace mocks
kubectl label namespace mocks env=true
```

and to deploy the mock
```bash
kubectl apply -n mocks -f https://raw.githubusercontent.com/kyma-incubator/varkes/master/odata-mock/deployment/deployment.yaml
```

