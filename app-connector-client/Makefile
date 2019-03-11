APP_NAME = varkes-app-connector-client
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
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
	rm -rf ./node_modules ./logs

run:
	npm start