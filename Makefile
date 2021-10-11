APP_NAME = varkes
varkes_version :=$(shell cat lerna.json | jq .version) #read project version.

ifeq ($(varkes_version), "0.0.0" )
        DOCKER_TAG=master # 0.0.0 means we are in master branch
else
        DOCKER_TAG=$(varkes_version) #else use defined version by lerna version
endif
.PHONY: ci-pr
ci-pr: resolve validate

.PHONY: ci-master
ci-master: resolve validate

.PHONY: ci-release
ci-release: resolve npm-publish docker-build docker-push

resolve:
	npx lerna bootstrap
	npx lerna run compile

validate:
	npx lerna run test

npm-publish:
	@echo "//registry.npmjs.org/:_authToken='${BOT_NPM_TOKEN}'" > .npmrc
	npx lerna publish from-package --yes
	sleep 60

clean:
	npx lerna clean
	npx lerna run clean

test:
	echo $(DOCKER_TAG)

docker-build:
	#call docker-build in sub makefiles with docker parameter
	npx lerna exec --no-bail -- make docker-build DOCKER_TAG=$(DOCKER_TAG)

docker-push:
	#call docker-push in sub makefiles with docker parameter
	npx lerna exec --no-bail -- make docker-push DOCKER_TAG=$(DOCKER_TAG)
