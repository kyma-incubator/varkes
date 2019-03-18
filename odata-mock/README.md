<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# OData Mock
[![npm version](https://badge.fury.io/js/varkes-odata-mock.svg)](https://badge.fury.io/js/varkes-odata-mock)

The OData mock mocks the application APIs based on the OData specification.

## Features

The OData mock brings you the following features:

- Supports OData edmx specification: Copy the edmx specification to the [EDMX_MODEL_SPECIFICATION.xml](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/EDMX_MODEL_SPECIFICATION.xml) file and the Engine will automatically create data model files for the entities specified in the specification

- Records every Request made to the node: Uses the [morgan](https://www.npmjs.com/package/morgan) logging framework to create `requests.log` file. This file contains the called URLs, the header of the request and the body of the request if exists.

- Returns the OData specification as metadata: Call `/odata/$metadata` to see the OData edmx specification being use in xml format

- Based on the n-odata package: The odata-mock application is based on the [n-odata-server](https://github.com/htammen/n-odata-server) project, which is based on [loopback](https://loopback.io/).

After startup, you have access to:
- odata API - `http://localhost:10000/odata/`
- odata metadata - `http://localhost:10000/odata/$metadata`
- rest API - `http://localhost:10000/api/console`


## Run mock

To run the mock locally, specify the [varkes config](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/src/test/varkes_config.json) file:
```
npm install
node server/server <varkes_config.json>
```

