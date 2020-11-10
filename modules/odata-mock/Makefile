APP_NAME = varkes-odata-mock
IMG = $(DOCKER_PUSH_REPOSITORY)$(DOCKER_PUSH_DIRECTORY)/$(APP_NAME)
resolve:
	npm install

validate:
	npm test

docker-build: ;

docker-push: ;

clean:
	rm -rf ./node_modules ./requests.log ./n_odata_server.log

run:
	npm start
