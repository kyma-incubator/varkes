APP_NAME = varkes-openapi-mock
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
resolve:
	npm install

validate:
	npm test

docker-build: ;

docker-push: ;

clean:
	rm -rf ./node_modules ./requests.log ./generated

run:
	npm start