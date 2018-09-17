# Deploying mock to Kyma

To deploy the created docker images to Kyma, or to kubernetes run the following commands in this folder.

- `kubectl create -f open-api-deploy.yaml`
- `kubectl create -f open-service.yaml`

The image defined in the *open-api-deploy.yaml* is from the last succesful build that integrates with lambda.