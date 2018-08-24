# Harmonia
*Harmonia* means "Harmony" in greek. This project aims to ensure harmony between Kyma and third party services before they are even deployed. To provide this *harmony* as easy as possible, Harmonia currently offers number of tools to create a mock of different api endpoints and events.

---
First prototype. It interacts with kyma to get client certificate and then deploys services to Kyma remote environment. It currently requires proxy-forward from kubectl to kyma instance.

   `kubectl.exe --kubeconfig=beta-config -n=kyma-integration port-forward svc/connector-service-internal-api 8080:8080`

This is only required for first request to get configuration token.

## App-Connector
- First go inside `app-connector`,
    - `npm install`
    - `npm start`

- It will create a new folder `keys` and run required workflow to get kyma-certificate. At the end of the process, there will be 3 keys (certificates) *ec-default.key*,  *test.csr*,  *kyma.crt*.

## Mock-Deployer
- Once above process is done, go to `mock-deployer`.
    - `npm install`
    - `npm start`

- It will deploy a very basic service instance defined in `basic-service-metadata.json`. You can see your service in kyma console, `ec-default` remote environment.

---

## Resources
- https://kyma-project.io/docs/latest/components/application-connector
- https://wiki.hybris.com/display/ysf/API+Mock+Concept
- https://github.com/kyma-project/kyma/tree/master/docs/application-connector/docs/assets

## Important 
This codebase is written for Windows. If you want to run it in *nix, go to `app-connector/app.js` and remove `.exe` from **openssl** commands.