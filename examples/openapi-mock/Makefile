
APP_NAME = example-openapi-mock

.PHONY: ci-pr
ci-pr: resolve validate docker-build

.PHONY: ci-master
ci-master: resolve validate docker-build docker-push

resolve:
	npm install

validate:
	npm test

docker-build:
	docker build -t $(APP_NAME):latest .

docker-push:
	docker tag $(APP_NAME) $(IMG):latest
	docker push $(IMG):latest

clean:
	rm -rf ./node_modules ./requests.log

run:
	npm start
