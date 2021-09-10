#!/usr/bin/env node
"use strict";

import * as config from "@kyma-incubator/varkes-configuration";
import * as connection from "../connection";
import {HttpLink} from "apollo-link-http";
import ApolloClient from "apollo-client";
import fetch from "cross-fetch";
import {InMemoryCache, NormalizedCacheObject} from "apollo-cache-inmemory";
import {setContext} from "apollo-link-context";
import {Agent} from "https";

const LOGGER: any = config.logger("app-connector");

export function createConnectorClient(token: string, connectorUrl: string, insecure: boolean) {
  const connectorLink = setContext((_, {headers}) => {
    return {
      headers: {
        ...headers,
        "connector-token": token,
      },
    };
  });

  const connectorHttpLink = new HttpLink({
    uri: connectorUrl,
    fetch: (...pl) => {
      const [_, options] = pl;
      const bodyString = options!.body || "{}";
      const body = JSON.parse(bodyString.toString());
      LOGGER.debug(`Query = ${body.operationName || ""}\n${body.query}`, body.variables);
      return fetch(...pl);
    },
    fetchOptions: {
      agent: new Agent({
        rejectUnauthorized: !insecure,
      }),
    },
  });

  const client = new ApolloClient({
    link: connectorLink.concat(connectorHttpLink),
    cache: new InMemoryCache(),
  });

  return client;
}
export function createSecuredConnectorClient(
  connectionInfo: connection.Info,
  certificate: Buffer,
  url: string
): ApolloClient<NormalizedCacheObject> {
  return createDirectorClientWithInfo(connectionInfo, certificate, url);
}
export function createDirectorClient(): ApolloClient<NormalizedCacheObject> {
  LOGGER.debug(`Using appId=${connection.info()!.application}`);

  return createDirectorClientWithInfo(connection.info()!, connection.certificate(), connection.info()!.metadataUrl);
}

export function createDirectorClientWithInfo(
  connectionInfo: connection.Info,
  certificate: Buffer,
  url: string
): ApolloClient<NormalizedCacheObject> {
  let authLink = setContext((_, {headers}) => {
    return {
      headers: {
        ...headers,
      },
    };
  });
  let httpLink = new HttpLink({
    uri: url,
    fetch: (...pl) => {
      const [_, options] = pl;
      const bodyString = options!.body || "{}";
      const body = JSON.parse(bodyString.toString());
      LOGGER.debug(`Query = ${body.operationName || ""}\n${body.query}`, body.variables);
      return fetch(...pl);
    },
    fetchOptions: {
      agent: new Agent({
        key: connection.privateKey(),
        cert: certificate,
        rejectUnauthorized: !connectionInfo.insecure,
      }),
    },
  });

  let client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
  return client;
}
