APP_NAME = varkes-api-server
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
resolve:
	npm install

validate:
	npm test

docker-build: ;

docker-push: ;

clean:
	rm -rf ./node_modules ./logs

run:
	npm start