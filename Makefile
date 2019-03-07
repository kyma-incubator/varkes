APP_NAME = varkes

.PHONY: ci-pr
ci-pr: resolve validate

.PHONY: ci-master
ci-master: resolve validate

.PHONY: ci-release
ci-release:
	echo "test"

resolve:
	npx lerna bootstrap --hoist

validate:
	npx lerna run test

npm-publish:
	npm run publish

clean:
	lerna clean
