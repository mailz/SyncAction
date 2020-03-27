# Sync Action

GitHub Action which syncs branches with selected branch. 

## Inputs

### `GITHUB_TOKEN`

**Required** Token to use github api

### `BRANCH`

**Required** Branch to make the pull-request against

### `PR_TITLE`

What you would like as the title of the pull request. Default: 'sync: {FROM_BRANCH} to {TO_BRANCH}'

### `PR_BODY` 

What you would like in the body of the pull request. Default: 'New code has just landed in {fromBranch} so let's bring {toBranch} up to speed!'


### Example usage
```javascript
uses: actions/SyncAction
with:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  BRANCH: "develop"
```