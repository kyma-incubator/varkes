#This is currently similar to our jenkins build, install and build the docker image.
APP_NAME = example-combined-odata-mock

.PHONY: ci-pr
ci-pr: resolve validate docker-build

.PHONY: ci-master
ci-master: resolve validate docker-build

resolve:
	npm install

validate:
	npm test

docker-build:
	docker build -t $(APP_NAME):latest .

clean:
	rm -rf ./node_modules ./requests.log ./n_odata_server.log

run:
	npm start
