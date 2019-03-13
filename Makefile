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
ci-release: npm-publish docker-push

resolve:
	npx lerna bootstrap --hoist

validate:
	npx lerna run test

npm-publish:
	echo "//registry.npmjs.org/:_authToken=\"${BOT_NPM_TOKEN}\"" > .npmrc
	lerna publish from-package --yes

clean:
	lerna clean

test:
	echo $(DOCKER_TAG)
docker-push:
	#call docker-push in sub makefiles with docker parameter
	lerna exec --no-bail -- make docker-push DOCKER_TAG=$(DOCKER_TAG)