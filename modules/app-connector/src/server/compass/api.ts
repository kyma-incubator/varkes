#!/usr/bin/env node
'use strict'

import * as config from "@varkes/configuration"
import * as connection from '../connection';
import * as converter from './converter';
import * as common from './common';
import gql from "graphql-tag";

const LOGGER: any = config.logger("app-connector")

export async function findAll(): Promise<any> {
  const query = gql`query($appId: ID!) {
    application (id : $appId){
      bundles{
        data{
          id
          name
          apiDefinitions { 
            data { 
              id 
              name 
              description
              targetURL
              spec {
                data format type 
              }  
            }
          }
          eventDefinitions {
            data {
              id
              name
              description
              spec {
                data format type
              }
            }
          }
        }
      }
    }
  }`;

  let result = await common.createDirectorClient().query({
    query: query,
    variables: {
      appId: connection.info()!.application
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`findAll api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`findAll had a GraphQL problem with message '${err.message}'`)
    };
  })
  LOGGER.debug(`Received FindAll Result = ${result.data.application ? JSON.stringify(result.data.application.bundles.data, ["id", "name", "apiDefinitions", "eventDefinitions", "data"], 2) : " application not found"}`)

  return result.data.application && result.data.application.bundles ? converter.convertBundleArrayToOldArray(result.data.application.bundles.data) : []
}

export async function create(api: any): Promise<any> {
  LOGGER.debug(`API = ${JSON.stringify(api, null, 2)}`);

  if (api.events) {
    return createEvent(api);
  } else {
    return createApi(api);
  }
}

async function createEvent(api: any) {
  let bundleId = await getBundleId(connection.info()!.application, api.varkes.bundleName)
  if (!bundleId) {
    bundleId = await createBundle(api.varkes.bundleName, undefined)
  }
  const payload = converter.convertEventToNew(api)
  LOGGER.debug(`Payload for event creation is: ${JSON.stringify(payload, null, 2)}`)

  const mutation = gql`mutation ($bundleId : ID! $payload : EventDefinitionInput!){
    addEventDefinitionToBundle(
      bundleID: $bundleId
      in: $payload  
    ){
      id
    }}`;

  let result = await common.createDirectorClient().mutate({
    mutation: mutation,
    variables: {
      bundleId: bundleId,
      payload: payload
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(JSON.stringify(err, null, 2));
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`Creating event failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`Creating event had a GraphQL problem with message '${err.message}'`)
    };
  })

  LOGGER.debug("Received event creation confirmation: %s", JSON.stringify(result.data.addEventDefinitionToBundle, ["id", "name"], 2))
  return result.data.addEventDefinitionToBundle
}

async function getBundleId(appId: string, bundleName: string): Promise<string | null> {
  LOGGER.debug(`Checking bundle with name: ${bundleName}`)
  const query = gql`query($appId: ID!) {
    application (id : $appId){
      bundles { 
        data {
          id
          name 
        }
      }
    }
  }`;

  let result = await common.createDirectorClient().query({
    query: query,
    variables: {
      appId: appId
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`getBundleId api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`getBundleId had a GraphQL problem with message '${err.message}'`)
    };
  })
  LOGGER.debug(`Received getBundleId Result = ${result.data.application ? JSON.stringify(result.data.application.bundles.data, null, 2) : " application not found"}`)

  if (result.data.application) {
    let entity = result.data.application.bundles.data.find((entity: any) => entity.name == bundleName)
    if (entity) {
      return entity.id
    }
  }
  return null
}

async function createBundle(bundleName: string, defaultAuth: any): Promise<string> {
  LOGGER.debug(`Creating bundle with name: ${bundleName}`)

  const payload = {
    name: bundleName,
    description: bundleName,
    defaultInstanceAuth:defaultAuth
  }
  const mutation = gql`mutation ($appId : ID! $payload : BundleCreateInput!){
    addBundle(
      applicationID: $appId
      in: $payload  
    ){
      id
    }}`;

  let result = await common.createDirectorClient().mutate({
    mutation: mutation,
    variables: {
      appId: connection.info()!.application,
      payload: payload
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(JSON.stringify(err, null, 2));
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`Creating bundle failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`Creating bundle had a GraphQL problem with message '${err.message}'`)
    };
  })

  LOGGER.debug("Received bundle creation confirmation: %s", JSON.stringify(result.data.addBundle, null, 2))
  return result.data.addBundle.id
}

async function createApi(api: any) {
  let bundleId = await getBundleId(connection.info()!.application, api.varkes.bundleName)
  if (!bundleId) {
    bundleId = await createBundle(api.varkes.bundleName, converter.convertAuthToNew(api))
  }
  const payload = converter.convertApiToNew(api)
  LOGGER.debug(`Payload for API creation is: ${JSON.stringify(payload, null, 2)}`)

  const mutation = gql`mutation ($bundleId : ID! $payload : APIDefinitionInput!){
    addAPIDefinitionToBundle(
      bundleID: $bundleId
      in: $payload  
    ){
      id
    }}`;

  let result = await common.createDirectorClient().mutate({
    mutation: mutation,
    variables: {
      bundleId: bundleId,
      payload: payload
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(JSON.stringify(err, null, 2));
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`Creating api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`Creating api had a GraphQL problem with message '${err.message}'`)
    };
  })

  LOGGER.debug("Received api creation confirmation: %s", JSON.stringify(result.data.addAPIDefinitionToBundle, ["id", "name"], 2))
  return result.data.addAPIDefinitionToBundle
}

export function update(api: any, id: string): Promise<any> {
  throw new Error("Update of API/Event is not supported yet for the compass scenario")
}

export async function findOne(bundleAndApiId: string): Promise<any | null> {
  let splitted = bundleAndApiId.split('_')
  if (splitted.length != 2) {
    throw new Error("Not a valid apiId for compass requests")
  }
  let bundleId = splitted[0]
  let apiId = splitted[1]
  let apiError;
  let eventError;

  const apiQuery = gql`query ($appId:ID!, $bundleId: ID!, $apiId: ID!){
    application (id : $appId){
      bundle(id : $bundleId){
        apiDefinition(id: $apiId) { 
            id 
            name 
            description
            targetURL
            spec {
              data format type 
            }
          }
        }
      }
    }`;

  let resultApi: any = await common.createDirectorClient().query({
    query: apiQuery,
    variables: {
      apiId: apiId,
      bundleId: bundleId,
      appId: connection.info().application
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`findOne api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      apiError = new Error(`findOne api had a GraphQL problem with message '${err.message}'`)
    };
  })

  if (!apiError && resultApi.data.application.bundle.apiDefinition) {
    LOGGER.debug("Received findOne api payload: %s", JSON.stringify(resultApi.data.application.bundle.apiDefinition, ["id", "name"], 2))
    return converter.convertApiToOld(bundleId, null, resultApi.data.application.bundle.apiDefinition);
  }

  const eventQuery = gql`query ($appId:ID!, $bundleId: ID!, $apiId: ID!){
    application (id : $appId){
      bundle (id : $bundleId){
        eventDefinition(id: $apiId) { 
          id 
          name 
          description
          spec {
            data format type 
          }
        }
      }
    }
  }`;
  let resultEvent: any = await common.createDirectorClient().query({
    query: eventQuery,
    variables: {
      apiId: apiId,
      bundleId: bundleId,
      appId: connection.info().application
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`findOne api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      eventError = new Error(`findOne api had a GraphQL problem with message '${err}'`)
    };
  })

  if (!eventError && resultEvent.data.application.bundle.eventDefinition) {
    LOGGER.debug("Received findOne event payload: %s", JSON.stringify(resultEvent.data.application.bundle.eventDefinition, ["id", "name"], 2))
    return converter.convertEventToOld(bundleId, null, resultEvent.data.application.bundle.eventDefinition);
  }

  throw apiError;
}

export async function remove(apiId: string): Promise<string | null> {
  let apiError;
  let eventError;

  const mutationApi = gql`mutation ($apiId : ID!){
    deleteAPIDefinition(
      id: $apiId
    ) {
      id
    }}`;

  let resultApi: any = await common.createDirectorClient().mutate({
    mutation: mutationApi,
    variables: {
      apiId: apiId
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`Deleting api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      apiError = new Error(`Deleting api had a GraphQL problem with message '${err.message}'`)
    };
  });

  if (!apiError) {
    LOGGER.debug("Received api deletion confirmation: %s", JSON.stringify(resultApi.data.deleteAPIDefinition, null, 2))
    return resultApi.data.deleteAPIDefinition;
  }

  const mutationEvent = gql`mutation ($apiId : ID!){
    deleteEventDefinition(
      id: $apiId
    ) {
      id
    }}`;

  let resultEvent: any = await common.createDirectorClient().mutate({
    mutation: mutationEvent,
    variables: {
      apiId: apiId
    }
  }).catch(err => {
    if (err.networkError) {
      LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`)
      throw new Error(`Deleting api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      eventError = new Error(`Deleting api had a GraphQL problem with message '${err.message}'`)
    };
  });

  if (!eventError) {
    LOGGER.debug("Received event deletion confirmation: %s", JSON.stringify(resultEvent.data.deleteEventDefinition, null, 2))
    return resultEvent.data.deleteEventDefinition;
  }
  throw apiError
}