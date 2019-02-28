# How Release Pipeline should work

Information:

- The version of the release is determined by package.json. When `npm publish` is called, It tries to create a new release with that version.

- `npm version patch` increases the patch number of the package.json. This change should be commited.

- We don't want to create a new release everytime we push to master.

# Proposal
1) We create a new branch called `release`. Release branch will only be updated when we have a new release. It will be only merged from master , **not from any other branch.**

2) We create a new job in Prow for release branch for PR coming from master. `pre-submit-release-job` runs the tests.

3) Once PR is merged to `release` branch, a `post-submit-release-job` is triggered. 

- It updates the version with `npm vervion`.
- Publishes the package with `npm publish`.
- Once publish is complete, kyma-bot merges release branch with master so that master branch also has the updated version number.

> This way while release process is automatic, it is controlled manually by opening a PR to release branch. Only one PR should be present for each release.

This approach testes the same code 2-3 times:

 - When there is a PR to master, `pre-submit-master-job` tests for individual changes.
 - When there is a PR to release , `pre-submit-release-job`, tests for all changes.
 - Optionally we can also add tests to `post-submit-release-job` to test with new version number.
```
 feature1 -> pr -> master  
 feature2 -> pr -> master  
 ...  
 master -> release candidate -> release  
 release -> prow-job -> npm registry  
 release -> merge -> master
 ```