#This is currently similar to our jenkins build, install and build the docker image.
.PHONY: ci docker_build
ci: resolve validate build
docker_build: build push

resolve:
	npm install

validate:
	npm test

setup:
	docker login -u $uname -p $pwd $registry
# To see docker build command refer to package.json/scripts build. => docker build -t varkes/openapi-mock .
build:
	docker build -t eu.gcr.io/kyma-project/varkes-odata-mock:latest .

push:
	docker push eu.gcr.io/kyma-project/varkes-odata-mock:latest


clean:
	rm -rf ./node_modules && rm -f tslinter.json whitesource.config.json ws-IsJson.json .npmrc

run:
	npm start
