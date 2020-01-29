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

  LOGGER.debug(`Received FindAll API Result = ${result.data.application ? JSON.stringify(result.data.application.apiDefinitions.data, ["id", "name"], 2) : " application not found"}`)
  LOGGER.debug(`Received FindAll Event Result = ${result.data.application ? JSON.stringify(result.data.application.eventDefinitions.data, ["id", "name"], 2) : " application not found"}`)

  let apis = result.data.application ? converter.convertApiArrayToOldArray(result.data.application.apiDefinitions.data) : []
  let events = result.data.application ? converter.convertEventArrayToOldArray(result.data.application.eventDefinitions.data) : []
  return apis.concat(events);
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
  const payload = converter.convertEventToNew(api)
  LOGGER.debug(`Payload for creation is: ${JSON.stringify(payload,null,2)}`)

  const mutation = gql`mutation ($appId : ID! $payload : EventDefinitionInput!){
    addEventDefinition(
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
      throw new Error(`Creating event failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`Creating event had a GraphQL problem with message '${err.message}'`)
    };
  })

  LOGGER.debug("Received event creation confirmation: %s", JSON.stringify(result.data.addEventDefinition, ["id", "name"], 2))
  return result.data.addEventDefinition
}

async function createApi(api: any) {
  const payload = converter.convertApiToNew(api)
  LOGGER.debug(`Payload for creation is: ${JSON.stringify(payload,null,2)}`)

  const mutation = gql`mutation ($appId : ID! $payload : APIDefinitionInput!){
    addAPIDefinition(
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
      throw new Error(`Creating api failed with status '${err.networkError.statusCode}' and message '${err.message}'`)
    } else {
      LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`)
      throw new Error(`Creating api had a GraphQL problem with message '${err.message}'`)
    };
  })

  LOGGER.debug("Received api creation confirmation: %s", JSON.stringify(result.data.addAPIDefinition, ["id", "name"], 2))
  return result.data.addAPIDefinition
}

export function update(api: any, id: string): Promise<any> {
  throw new Error("Update of API/Event is not supported yet for the compass scenario")
}

export async function findOne(apiId: string): Promise<any | null> {
  let apiError;
  let eventError;

  const apiQuery = gql`query ($appId:ID!, $apiId: ID!){
    application (id : $appId){
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
    }`;

  let resultApi: any = await common.createDirectorClient().query({
    query: apiQuery,
    variables: {
      apiId: apiId,
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

  if (!apiError && resultApi.data.application.apiDefinition) {
    LOGGER.debug("Received findOne api payload: %s", JSON.stringify(resultApi.data.application.apiDefinition, ["id", "name"], 2))
    return converter.convertApiToOld(resultApi.data.application.apiDefinition);
  }

  const eventQuery = gql`query ($appId:ID!, $apiId: ID!){
    application (id : $appId){
      eventDefinition(id: $apiId) { 
        id 
        name 
        description
        spec {
           data format type 
        }
      }
    }
  }`;
  let resultEvent: any = await common.createDirectorClient().query({
    query: eventQuery,
    variables: {
      apiId: apiId,
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

  if (!eventError && resultEvent.data.application.eventDefinition) {
    LOGGER.debug("Received findOne event payload: %s", JSON.stringify(resultEvent.data.application.eventDefinition, ["id", "name"], 2))
    return converter.convertEventToOld(resultEvent.data.application.eventDefinition);
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