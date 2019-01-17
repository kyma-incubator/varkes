
APP_NAME = example-openapi-mock

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
	rm -rf ./node_modules ./requests.log

run:
	npm start
