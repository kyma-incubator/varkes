
APP_NAME = varkes-odata-mock
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
TAG = $(DOCKER_TAG)

resolve:
	npm install

validate:
	npm test

docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	#DOCKER_TAG comes as parameter from outside -> make docker-push DOCKER_TAG=master
	echo $(DOCKERT_TAG)
	docker tag $(APP_NAME) $(IMG):$(DOCKER_TAG)
	docker push $(IMG):$(DOCKER_TAG)

clean:
	rm -rf ./node_modules ./requests.log ./n_odata_server.log

run:
	npm start
