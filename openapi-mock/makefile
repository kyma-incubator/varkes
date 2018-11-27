#This is currently similar to our jenkins build, install and build the docker image.
.PHONY: ci
ci: resolve validate


resolve:
	npm install

validate:
	npm test

# To see docker build command refer to package.json/scripts build. => docker build -t varkes/openapi-mock .
build:
	dcoker build -t badrawi/openapi-mock .

push:
	docker push badrawi/openapi-mock

clean:
	rm -rf ./node_modules && rm -f tslinter.json whitesource.config.json ws-IsJson.json .npmrc

run:
	npm start
