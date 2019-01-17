#This is currently similar to our jenkins build, install and build the docker image.
APP_NAME = varkes-openapi-mock
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

docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	docker tag $(APP_NAME) $(IMG):latest
	docker push $(IMG):latest

npm-publish:
	npm version "patch" --git-tag-version=false
	npm publish

clean:
	rm -rf ./node_modules ./requests.log

run:
	npm start
