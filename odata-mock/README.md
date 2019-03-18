<p align="center">
 <img src="https://raw.githubusercontent.com/kyma-incubator/varkes/master/logos/logo_medium.png" width="235">
</p>

# OData Mock
[![npm version](https://badge.fury.io/js/varkes-odata-mock.svg)](https://badge.fury.io/js/varkes-odata-mock)

The OData mock mocks the application APIs based on the OData specification.

## Features

The OData mock brings you the following features:

- Based on the n-odata package: The odata-mock application is based on the [n-odata-server](https://github.com/htammen/n-odata-server) project, which is based on [loopback](https://loopback.io/).

- Records every request made to the node: Uses the [morgan](https://www.npmjs.com/package/morgan) logging framework to create `requests.log` file. This file contains the called URLs, the header of the request and the body of the request if exists.

- Returns the OData specification as metadata: Call `/odata/$metadata` to see the OData edmx specification being use in xml format.


After startup, you have access to:
- odata API - `http://localhost:10000/odata/`
- odata metadata - `http://localhost:10000/odata/$metadata`
- rest API - `http://localhost:10000/api/console`


## Development

To run the Odata mock locally, use an empty configuration:
```
npm install

```
To run it locally with debug logs enabled, and an example configuration from the test suite, run:

```
npm run start:dev

```