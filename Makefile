APP_NAME = varkes-mocking-suite

.PHONY: ci-pr
ci-pr: resolve validate

.PHONY: ci-master
ci-master: resolve validate

resolve:
	npx lerna bootstrap --hoist

validate:
	npx lerna run test

npm-publish:
	lerna publish

clean:
	lerna clean
