#!/usr/bin/env node
'use strict'

type Config = {
    name: string,        //optional name of the mock to be displayed in UI. If not provided, 'application' attribute with " Mock" suffix will be used. If 'application' is not set the default will be "Varkes".
    logo: string,        //optional logo of the mock to be displayed in UI, only SVG is supported
    provider: string,    //optional text to display in the creator/provider field of the ServiceClass entry for an API. Default is "Varkes"
    application: string, //optional name of the application which is mocked. Value will be used as prefix for every API name
    apis: API[],         //optional APIs to mock and register
    events: Event[],     //optional event APIs to register
    package: string,     //optional package name to be used for API management with compass
    location: string     //Do not set: internal attribute to store the absolue path to this configuration itself
}

type Event = {
    specification: string, //mandatory location of asyncapi specification, either a path or URL
    name: string,          //optional name to be used for registration, if not set the info.title attribute of the specification gets used
    description: string,   //optional desciption to be used for registration, if not set the info.description attribute of the specification gets used with fallback to the 'name' option
    labels: any            //optional additional labels to be set for registration
}
type API = {
    basepath: string,           //mandatory location of openapi or odata specification, either a path or URL
    auth: APIAuth,              //optional authentication method used by the API. Dependent on the method a mock auth endpoint 
    oauth: string,              //optional basepath for oauth token endpoint in case oauth is configured as auth method
    name: string,               //optional name to be used for registration, if not set the info.title attribute of the specification gets used
    description: string,        //optional desciption to be used for registration, if not set the info.description attribute of the specification gets used with fallback to the 'name' option
    metadata: string,           //optional basepath to the metadata endpoint, default is value from 'basepath' suffixed with /metadata
    specification: string,      //mandatory location of openapi or odata specification, either a path or URL
    type: APIType,              //optional type of the configured API, will be resolved automatical depending on file extension
    persistence: boolean,       //default false, enables persistence for the mocked API. Instead of created data in memory, a "./data" folder gets created for storing the data
    registerBasepath: boolean,  //default true, appends the API basepath to the targetUrl as part of the registration
    registerSpec: boolean,      //default true for OpenAPI, false for ODATA, if true the spec will be provided in the registration as payload, if false a URL to the metadata only will be provided as part of the registration
    labels: any,                //optional additional labels to be set for registration
    csrf: boolean               //default false, adds CSRF header support for ODATA Apis
}

export enum APIType {
    OData = "odata",
    OpenAPI = "openapi"
}

export enum APIAuth {
    OAuth = "oauth",
    Basic = "basic",
    None = "none"
}

export { Config, API, Event }
