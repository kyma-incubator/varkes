APP_NAME = varkes-api-server
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
resolve:
	npm install

validate:
	npm test

docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	#DOCKER_TAG comes as parameter from outside -> make docker-push DOCKER_TAG=master
	echo $(DOCKER_TAG)
	docker tag $(APP_NAME):latest $(IMG):$(DOCKER_TAG)
	docker push $(IMG):$(DOCKER_TAG)
	#also push latest
	docker tag $(IMG):$(DOCKER_TAG) $(IMG):latest
	docker push $(IMG):latest

clean:
	rm -rf ./node_modules ./logs

run:
	npm start