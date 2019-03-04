# Release Process

Assumptions:

- The version of the release is determined by package.json. When `npm publish` is called, It tries to create a new release with that version.

- We don't want to create a new release everytime we push to master.

# Proposal
1) New features are merged to `master` branch. `pre-submit` and `post-submit jobs` do just testing. They have the same functionality.

2) When we want a new release , we open a new branch with proposed release number & run `npm version` to update package version manually, then open a PR. `npm version` also creates a git tag.

3) When the proposed release PR is accepted but not yet merged we run `npm publish` to publish it to registry. That way , while we are discussing a release candidate we can continue working on master and do rebases to add features to RC before it's merged.

4) Once release is complete we merge the release candidate to master. This will trigger the `post-submit-master-job` again but it will only do testing. New release will be stored in a git tag , so we can delete the RC branch.

> This process is manual and does not require any bot to perform git operations. The branching is only between master and RC.

```
    RC->npm version->discussions -> accepted -> npm publish
    /                 /(rebase-merge)                     \
master->feature1->master->...                       ...->master
 ```

After this process master will have the new version but may also have features that are not yet published. Those features will be included in the next RC PR. 