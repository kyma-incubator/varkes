#This is currently similar to our jenkins build, install and build the docker image.
APP_NAME = varkes-openapi-mock
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
TAG = $(DOCKER_TAG)

resolve:
	npm install

validate:
	npm test

docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	make docker-build
	#DOCKER_TAG comes as parameter from outside -> make docker-push DOCKER_TAG=master
	echo $(DOCKERT_TAG)
	docker tag $(APP_NAME) $(IMG):$(DOCKER_TAG)
	docker push $(IMG):$(DOCKER_TAG)

clean:
	rm -rf ./node_modules ./requests.log ./generated

run:
	npm start
