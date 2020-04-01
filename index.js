const core = require('@actions/core');
const github = require('@actions/github');

// const checkError = (result) => {
//   if (result != null || result > 0) {
//     console.error(`exec error: ${result.error}`);
//     console.error(`stderr: ${result.stderr}`);
//     throw new Error(`exec error: ${result.error}`);
//   }
//   console.log(`stdout: ${result.stdout}`);
// }

try {
  const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
  const branch = core.getInput("BRANCH", { required: true });
  // const pullRequestTitle = core.getInput("PR_TITLE");
  // const pullRequestBody = core.getInput("PR_BODY");

  const payload = github.context.payload;
  let commits = payload.commits;
  // console.log(`commits: `+ JSON.stringify(commits, undefined, 2));

  let updateBranch = `update/update_to_${payload.after}`;
  console.log(`update branch is: ${updateBranch}`);
  let hashesToCherryPick = []; 
  for (let i = 0; i < commits.length; i++) {
    let currentCommit = commits[i];
    if (currentCommit.distinct == true) {
       hashesToCherryPick.push(currentCommit.id);
    }
  }
  
  
  
  
  console.log(`Commit hashes to cherry pick: ${hashesToCherryPick}`);
  //move commits
  const { execSync } = require(`child_process`);
  //set user 
  execSync(`git config --global user.email "${payload.pusher.email}"`)
  execSync(`git config --global user.name "${payload.pusher.name}"`)

  execSync(`git fetch --prune --unshallow`)
  execSync(`git checkout ${branch}`);
  execSync(`git branch ${updateBranch}`);
  execSync(`git checkout ${updateBranch}`);
  console.log(execSync(`git status`));
  for (let i = 0; i < hashesToCherryPick.length; i++) {
    execSync(`git cherry-pick ${hashesToCherryPick[i]}`);
  }
  execSync(`git push -v -u origin refs/heads/${updateBranch}:refs/heads/${updateBranch}`);
  //create PR

} catch (error) {
  core.setFailed(error.message);
}


