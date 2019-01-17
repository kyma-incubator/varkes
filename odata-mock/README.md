# OData Mock

Mocks rest calls given an OData specification 

After startup, you have access to:
- odata API - http://localhost:10000/odata/myResource
- rest API - http://localhost:10000/api/myResource/metadata
- console - http://localhost:10000/api/console

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

## Installation and Use

Install using [NPM](https://docs.npmjs.com/getting-started/what-is-npm).

````bash
npm install
````
Then you need to copy your OData edmx into the common directory as [EDMX_MODEL_SPECIFICATION.xml](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/EDMX_MODEL_SPECIFICATION.xml)<br>
OR you could simply change the path in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/config.js) file specified by the "specification_file" element
<br>
When you run the mock application for the first time the [parser.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/common/utility/parser.js) module creates a javascript file and a json file for every entity defined in the edmx specifiaction using the templates [modelTemplate.json](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/common/models/modelTemplate.json) as the json template ( for every model the name is the entity name and the plural is the entity name and adding an 's' at the end so if the entity name is 'user' the plural used in the get endpoint is 'users') and [jsModel.txt](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/common/models/jsModel.txt) as the js template replacing the 'placeholder' substring with the entity name.
Also the  [parser.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/common/utility/parser.js) module creates the definition of these entities in the [model-config.json](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/server/model-config.json) file.You can think of this file as a catalog for our database defining User Roles, security permission along side the entity definitions.
<br>
The following is an example to an entity definition in the edmx file

````xml
<EntityType Name="AssignedInterestsType" sap:label="Marketing: Campaign Template-Interest" sap:content-version="1">
    <Key>
     <PropertyRef Name="ItemOfInterest"/>
     <PropertyRef Name="CampaignTemplate"/>
    </Key>
    <Property Name="ItemOfInterest" Type="Edm.String" Nullable="false" MaxLength="40" sap:display-format="UpperCase" sap:label="Item of Interest"/>
    <Property Name="CampaignTemplate" Type="Edm.String" Nullable="false" MaxLength="10" sap:display-format="UpperCase" sap:label="Campaign ID"/>
   </EntityType>
````
<br>
You can add data to an Entity using the [data.json](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/storage/data.json) file. So for the above entity the file will look like this

````json
{
  "ids": {
    "User": 1,
    "AccessToken": 1,
    "ACL": 1,
    "RoleMapping": 1,
    "Role": 1,
    "person": 39,
    "AssignedInterestsType": 2,
    "TeamMembersType": 2
  },
  "models": {
    "User": {},
    "AccessToken": {},
    "ACL": {},
    "RoleMapping": {},
    "Role": {},
    "AssignedInterestsType": {
      "1": "{\"ItemOfInterest\":\"Item1\",\"CampaignTemplate\":\"Item2\",\"id\":1}"
    }
  }
}
````


Node js code
--------------------------

The entry point for the application is the server/server.js file which reads the edmx file [EDMX_MODEL_SPECIFICATION.xml](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/EDMX_MODEL_SPECIFICATION.xml) using [parser.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/common/utility/parser.js)
<br>
The mock application offers the following
- **Parse the edmx specification file and creates entity files that represent databases** <br>

- **Provide custom Error messages for given status codes given in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/config.js):** <br>
The error messages are written in the config file as a json key called error_messages as follows:<br>

````javascript
error_messages: {
        500: '{"error":\"Something went Wrong\"}',
        401: '{"error":\"401 Entity does not exist\"}',
        404: '{"error":\"404 Bad URL\"}'
    }
````
<br>
This json object is processed by the [routes.js](https://github.com/kyma-incubator/varkes/blob/master/examples/odata-mock-app/server/boot/routes.js) which checks if the error code exists in the config file and if so it sends it's corresponding message as response as follows.
````javascript
 function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {

            if (!arguments[0] || !arguments[0].statusCode) {
                arguments[0] = {};
                arguments[0].statusCode = 500;
            }
            if (app.config.error_messages.hasOwnProperty(arguments[0].statusCode)) {
                arguments[0] = app.config.error_messages[arguments[0].statusCode];
            }
            oldSend.apply(res, arguments);
        }
        next();
    }

    app.use(modifyResponseBody);
````
Note: The messages (ex. '{"error":\"Something went Wrong\"}') could be any string doesn't have to be a json-like string<br>


