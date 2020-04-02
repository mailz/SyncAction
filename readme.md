# Sync Action

GitHub Action which moves commits from one branch to another branch

## Inputs

### `GITHUB_TOKEN`

**Required** Token to use github api

### `BRANCH`

**Required** Branch to make the pull-request against

### Example usage
```javascript
uses: actions/SyncAction
with:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  BRANCH: "develop"
```