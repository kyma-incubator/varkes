# Basic Remote Environment 
This folder mocks a remote environment in the most basic way by providing one endpoint for data and one for oauth. This is just for developing purposes. **Don't refer to this repo for production.**

## Motivation

Remote Environment mocking repos use various packages and build process is longer. They are designed to be used with docker so this is not a problem. To deploy a new RE for testing the application connector ,
-  we have to change the code, 
- create a push, 
- run jenkins to build docker images , 
- deploy these docker images

so that we can reach it. This repo shortens this process by bypassing the whole build process.

This is how it works:
- Change your code in express server.
- Create a http tunnel. More info about this can be read in **tunneling** section.


## Tunneling

You need a http tunneling application. This project uses [localtunnel](https://localtunnel.github.io/www/). 

- Download *localtunnel* globally by `npm install -g localtunnel`.
- Run your application with `npm start` in this folder.
- Start tunneling with `lt --port 4000`. This application uses 4000 as port, change it accordingly.
- *Localtunnel* will give you a hostname similar to `https://tough-lizard-87.localtunnel.me`. This is globally reachable. Add this to you service definition. 

## Structure
This project has both Jenkinsfile and Dockerfile for completeness but they are not referred in the build process.