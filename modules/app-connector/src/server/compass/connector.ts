#!/usr/bin/env node
"use strict";

import * as connection from "../connection";
import * as common from "./common";
import * as commonCommon from "../common";
import * as config from "@varkes/configuration";
import gql from "graphql-tag";
import { DocumentNode } from "graphql";

const LOGGER: any = config.logger("app-connector");

async function getConfigurationCertSecured(connection: connection.Info, certificate: Buffer): Promise<any> {
  const func: Function = () => common.createSecuredConnectorClient(connection, certificate, connection.renewCertUrl!);
  const configurationQuery = gql`
    {
      result: configuration {
        certificateSigningRequestInfo {
          subject
          keyAlgorithm
        }
        managementPlaneInfo {
          directorURL
        }
      }
    }
  `;
  return getConfigurationBase(func, connection.renewCertUrl!, configurationQuery);
}

async function getConfiguration(token: string, url: string, insecure: boolean): Promise<any> {
  const func: Function = () => common.createConnectorClient(token, url, insecure);

  const configurationQuery = gql`
    {
      result: configuration {
        token {
          token
        }
        certificateSigningRequestInfo {
          subject
          keyAlgorithm
        }
        managementPlaneInfo {
          directorURL
          certificateSecuredConnectorURL
        }
      }
    }
  `;

  return getConfigurationBase(func, url, configurationQuery);
}

async function getConfigurationBase(
  connectorClientFn: Function,
  url: string,
  configurationQuery: DocumentNode
): Promise<any> {
  var result = await connectorClientFn()
    .query({
      query: configurationQuery,
    })
    .catch((err: any) => {
      if (err.networkError) {
        LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`);
        throw new Error(
          `Getting configuration with URL '${url}' failed with status '${err.networkError.statusCode}' and message '${err.message}'`
        );
      } else {
        LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`);
        throw new Error(`Getting configuration had a GraphQL problem with message '${err.message}'`);
      }
    });
  LOGGER.debug(`Received configuration response = ${JSON.stringify(result, null, 2)}`);
  return result.data.result;
}

export function renewalCertificateSigningRequest(
  url: string,
  connection: connection.Info,
  certificate: Buffer,
  configuration: any
) {
  LOGGER.debug("Sending signCertificateSigningRequest to: %s", url);
  const func: Function = () => common.createSecuredConnectorClient(connection, certificate, connection.renewCertUrl!);
  return signCertificateSigningRequestBase(func, url, configuration.certificateSigningRequestInfo.subject);
}

export function signCertificateSigningRequest(url: string, insecure: boolean, configuration: any) {
  LOGGER.debug("Sending signCertificateSigningRequest to: %s", url);
  const func: Function = () => common.createConnectorClient(configuration.token.token, url, insecure);
  return signCertificateSigningRequestBase(func, url, configuration.certificateSigningRequestInfo.subject);
}

async function signCertificateSigningRequestBase(connectorClientFn: Function, url: string, subject: string) {
  const SignCertificateSigningRequestMutation = gql`
    mutation($csr: String!) {
      result: signCertificateSigningRequest(csr: $csr) {
        certificateChain
        caCertificate
        clientCertificate
      }
    }
  `;

  const csr: Buffer = commonCommon.generateCSR(subject, connection.privateKey());

  var result = await connectorClientFn()
    .mutate({
      mutation: SignCertificateSigningRequestMutation,
      variables: {
        csr: csr.toString("base64"),
      },
    })
    .catch((err: any) => {
      if (err.networkError) {
        LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`);
        throw new Error(
          `Sending CSR with URL '${url}' failed with status '${err.networkError.statusCode}' and message '${err.message}'`
        );
      } else {
        LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`);
        throw new Error(`Sending CSR had a GraphQL problem with message '${err.message}'`);
      }
    });
  LOGGER.debug(`Received CSR`);
  const encodedCert = result.data.result.certificateChain;
  return Buffer.from(encodedCert, "base64");
}

export async function legacyEventsUrl(): Promise<string> {
  const query = gql`
    query($appId: ID!) {
      application(id: $appId) {
        eventingConfiguration {
          defaultURL
        }
      }
    }
  `;

  let result = await common
    .createDirectorClient()
    .query({
      query: query,
      variables: {
        appId: connection.info()!.application,
      },
    })
    .catch((err) => {
      if (err.networkError) {
        LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`);
        throw new Error(`eventsURL failed with status '${err.networkError.statusCode}' and message '${err.message}'`);
      } else {
        LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`);
        throw new Error(`eventsURL had a GraphQL problem with message '${err.message}'`);
      }
    });

  if (result.data.application) {
    LOGGER.debug(`Received eventsURL Result = ${JSON.stringify(result.data.application.eventingConfiguration, null, 2)}`);
    if (result.data.application.eventingConfiguration) {
      LOGGER.debug("Legacy events URL: %s", result.data.application.eventingConfiguration.defaultURL)
      return result.data.application.eventingConfiguration.defaultURL;
    }
  }
  throw new Error("Cannot determine an endpoint for sending events, is the application " + connection.info()!.application + " assigned to a runtime?");
}

export async function cloudEventsUrl(): Promise<string> {
  let legacyUrl = await legacyEventsUrl();

  let cloudeventsUrl = legacyUrl.replace("/v1/events", "/events");
  LOGGER.debug("Cloud events URL: %s", cloudeventsUrl)
  return cloudeventsUrl;
}

async function queryAppID(connectionInfo: connection.Info, certificate: Buffer): Promise<string> {
  const query = gql`
    query {
      viewer {
        id
        type
      }
    }
  `;

  let result = await common
    .createDirectorClientWithInfo(connectionInfo, certificate, connectionInfo.metadataUrl)
    .query({
      query: query,
    })
    .catch((err) => {
      if (err.networkError) {
        LOGGER.debug(`Detailed network error: ${JSON.stringify(err.networkError, null, 2)}`);
        throw new Error(
          `viewer query failed with status '${err.networkError.statusCode}' and message '${err.message}'`
        );
      } else {
        LOGGER.debug(`Detailed graphQL error: ${JSON.stringify(err.graphQLErrors, null, 2)}`);
        throw new Error(`viewer query had a GraphQL problem with message '${err.message}'`);
      }
    });

  LOGGER.debug(`Received viewer Result = ${JSON.stringify(result.data.viewer, null, 2)}`);
  if (result.data.viewer.type != "APPLICATION") {
    throw new Error(`viewer query result is of type '${result.data.viewer.type}' but should be of type 'APPLICATION'`);
  }
  return result.data.viewer.id;
}

export async function connect(token: string, persistFiles: boolean = true, insecure: boolean = false): Promise<any> {
  let connectorUrl;
  let connectorToken;

  try {
    let rawToken = Buffer.from(token, "base64").toString("utf8");
    let jsonToken = JSON.parse(rawToken);
    connectorToken = jsonToken.token;
    connectorUrl = jsonToken.connectorURL;
  } catch (error) {
    throw new Error(`Invalid token for connecting to compass: ${error.message}`);
  }

  let configResult = await getConfiguration(connectorToken, connectorUrl, insecure);
  let certificateData = await signCertificateSigningRequest(connectorUrl, insecure, configResult);

  let directorUrl = configResult.managementPlaneInfo.directorURL;

  let connectionData: connection.Info = {
    insecure: insecure,
    persistFiles: persistFiles,
    metadataUrl: directorUrl,
    infoUrl: "",
    renewCertUrl: configResult.managementPlaneInfo.certificateSecuredConnectorURL,
    revocationCertUrl: configResult.managementPlaneInfo.certificateSecuredConnectorURL,
    consoleUrl: directorUrl.replace("compass-gateway-mtls", "compass").replace("/director/graphql", ""),
    applicationUrl: directorUrl
      .replace("compass-gateway-mtls", "compass")
      .replace("/director/graphql", "/tenant/default/applications/details/"),
    application: "",
    type: connection.Type.Compass,
  };

  let appId = await queryAppID(connectionData, certificateData);
  connectionData.application = appId;
  connectionData.applicationUrl = connectionData.applicationUrl + appId;

  return { connection: connectionData, certificate: certificateData };
}

export async function renewCertificate(connection: connection.Info, certificate: Buffer, privateKeyData: Buffer) {
  let configResult = await getConfigurationCertSecured(connection, certificate);
  return await renewalCertificateSigningRequest(connection.renewCertUrl!, connection, certificate, configResult);
}
