#This is currently similar to our jenkins build, install and build the docker image.
APP_NAME = app-connector-client
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
TAG = $(DOCKER_TAG)

.PHONY: ci-pr
ci-pr: resolve validate docker-build docker-push

.PHONY: ci-master
ci-master: resolve validate docker-build docker-push npm-publish

resolve:
	npm install

validate:
	npm test

# To see docker build command refer to package.json/scripts build. => docker build -t varkes/openapi-mock .
docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	docker tag $(APP_NAME) $(IMG):$(TAG)
	docker push $(IMG):$(TAG)

npm-publish:
	npm version "patch" --git-tag-version=false
	npm publish

clean:
	rm -rf ./node_modules ./test.log ./server.log

run:
	npm start
