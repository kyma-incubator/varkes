# Release Process

Assumptions:

- The version of the release is determined by package.json. When `npm publish` is called, It tries to create a new release with that version.

- We don't want to create a new release everytime we push to master.

# Proposal
1) New features are merged to `master` branch. `pre-submit` and `post-submit jobs` do just testing. They have the same functionality.

2) There is a new branch called `release` that is only used by the release process. When we want to create a new release, we create a new branch from master with the new release name and run `npm version (lerna version)` locally and push to update versions in package.json.

3) When we are satisfied with the release candidate, we open a PR to the `release` branch. The PR runs `pre-submit-release-job`, to test the project with the new versions.

4) When PR is merged to `release branch`, `post-submit-release-job` runs `publish` command and uses kyma-project npm token to publish varkes to npm registry. 

5) The branch with the individual release name can be deleted. Different versions will be tracked by git tag created in step 2.

> This approach allows us to have dummy version numbers in master. For each RC, we can define a custom version number and keep the version in master always 0.1.0. That way we don't have to merge back from release to master.

