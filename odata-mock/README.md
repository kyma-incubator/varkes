OData Mock
============================
#### Mocks rest calls given an OData specification 


Features
---------------------------

- **Supports OData edmx specification** <br>
Copy the edmx specification to the [EDMX_MODEL_SPECIFICATION.xml]((https://github.com/kyma-incubator/varkes/blob/master/OData/common/EDMX_MODEL_SPECIFICATION.xml) file and the Engine will automatically create data model files for the entities specified in the specification

- **Records Every Request made to the node** <br>
Creates a requests.log file that contains the urls being called, the header of the request and the body of the request if exists using the [morgan](https://www.npmjs.com/package/morgan) logging framework.

- **Returns the OData specification as metadata** <br>
By calling `/odata/$metadata` user can see the OData edmx specification being use in xml format

- **Returns a dummy OAuth2 token** <br>
By posting to url `odata/authorizationserver/oauth/token` the OAuth2 requirements in the request body, user can get a dummy OAuth2 token

- **Based on the n-odata package** <br>
the odata-mock application is based on the [n-odata-server](https://github.com/htammen/n-odata-server) project, which is based on [loopback](https://loopback.io/) 

Installation and Use
--------------------------
Install using [NPM](https://docs.npmjs.com/getting-started/what-is-npm).

````bash
npm install
````
Then you need to copy your OData edmx into the common directory as [EDMX_MODEL_SPECIFICATION.xml](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/EDMX_MODEL_SPECIFICATION.xml)<br>
OR you could simply change the path in the [config.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/server/config.js) file specified by the "specification_file" element
<br>
When you run the mock application for the first time the [parser.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/utility/parser.js) module creates a javascript file and a json file for every entity defined in the edmx specifiaction using the templates [modelTemplate.json](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/models/modelTemplate.json) as the json template ( for every model the name is the entity name and the plural is the entity name and adding an 's' at the end so if the entity name is 'user' the plural used in the get endpoint is 'users') and [jsModel.txt](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/models/jsModel.txt) as the js template replacing the 'placeholder' substring with the entity name.
Also the  [parser.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/utility/parser.js) module creates the definition of these entities in the [model-config.json](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/server/model-config.json) file.You can think of this file as a catalog for our database defining User Roles, security permission along side the entity definitions.
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
You can add data to an Entity using the [data.json](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/storage/data.json) file. So for the above entity the file will look like this

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

The entry point for the application is the server/server.js file which reads the edmx file [EDMX_MODEL_SPECIFICATION.xml](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/EDMX_MODEL_SPECIFICATION.xml) using [parser.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/common/utility/parser.js)
<br>
The mock application offers the following

- **Writing custom code for handling some of the responses and registering them to the express app [routes.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/server/boot/routes.js).** <br>
        The following is an example of listening to the get endpoint "'/authorizationserver/oauth/" checking if the required parameters are submitted, then returning the redirect_uri enetred as a query parameter and adding to it the token
````javascript
app.get('/authorizationserver/oauth/*', function (req, res, next) {
        if (req.query.response_type && req.query.scope) {
            if (req.query.redirect_uri) {
                res.status(200)
                res.send(req.query.redirect_uri + "#token=7777");
            }
            else
                res.send('Please, enter redirected_uri');
        }
        else {
            res.status(404)
            res.send('Wrong parameters');
        }

    });
````
- **Add a some extra items to the default response** <br>
        The following is an example of changing the error message in the response depending on the status code
````javascript
 function modifyResponseBody(req, res, next) {
        var oldSend = res.send;

        res.send = function (data) {
            // arguments[0] (or `data`) contains the response body
            if (arguments[0].statusCode == 401) {
                arguments[0] = "401 Entity does not exist";
            }
            else if (arguments[0].statusCode == 404) {
                arguments[0] = "404 Bad URL";
            }
            oldSend.apply(res, arguments);
        }
        next();
    }
````
- **Return custom Error messages as response to certain error codes or messages in the customErrorResponses function** <br>
        Since this application is based on [n-odata-server](https://github.com/htammen/n-odata-server); we need to handle custom errors for the 'api' based uris and for the 'odata' based uris.
        For the api-based calls we use the follwing function in the [config-local.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/server/config-local.js) file.

````javascript
module.exports = {
    remoting: {
        errorHandler: {
            handler: function (err, req, res, next) {
                // custom error handling logic
                console.log("error status")
                console.log(err.status)
                if (!err.status) {
                    res.status(500);
                    res.type('json');
                    res.send(util.format('{error:\"Something went Wrong\"}'));
                }
                else if (err.status == 404) {
                    res.status(err.status);
                    res.type('json');
                    var util = require('util');
                    res.send(util.format('{error:\"This is not a valid endpoint\"}', err.status, err.message));
                }
            }
        }
    }
};
````
<br>
Yo also need to add the handler key 'errorHandler' given above to the [middleware.json](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/server/middleware.json) file as follows

````json
"files": {},
  "final": {
    "loopback#urlNotFound": {}
  },
  "final:after": {
    "loopback#errorHandler": {}
  }
````
For the odata-based calls we need to modify the message given by the response depending on the error status as mentioned in the previous point.

 Starting the application
--------------------------
There are two ways to start the application.

- **start it as a node using npm command as follows:** <br>
Go to the directory of the application and write in the terminal
````bash
npm start
````

- **start it as a docker image as follows:** <br>

Go to the directory of the application and write in the terminal
````bash
docker build -t <tag_name> .
docker run -p <chosen_ip>:3000 <tag_name>
````
- **start the tests as follows:** <br>

unit tests are written in the [test_odata.js](https://github.com/kyma-incubator/varkes/blob/master/odata-mock/test/test_odata.js) file and the tests are run using the [mocha](https://mochajs.org/) framework.
Go to the directory of the application and write in the terminal
 ````bash
npm test
````
Note: You should run the application once before running your api tests in order to create the entities.

