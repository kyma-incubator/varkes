APP_NAME = varkes

.PHONY: ci-pr
ci-pr: resolve validate

.PHONY: ci-master
ci-master: resolve validate

.PHONY: ci-release
ci-release: npm-publish

resolve:
	npx lerna bootstrap --hoist

validate:
	# a workaround to run kyma-mock to test app-connector
	npm start --prefix examples/kyma-mock &
	npx lerna run test

npm-publish:
	lerna publish from-package --yes

clean:
	lerna clean

