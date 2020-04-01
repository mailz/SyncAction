const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const branch = core.getInput("BRANCH", { required: true });
    // const pullRequestTitle = core.getInput("PR_TITLE");
    // const pullRequestBody = core.getInput("PR_BODY");

    const payload = github.context.payload;
    let commits = payload.commits;
    const fromBranch = payload.ref
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
    console.log(`update user to login: ${payload.pusher.name}, mail: ${payload.pusher.email}`);
    execSync(`git config --global user.email "${payload.pusher.email}"`)
    execSync(`git config --global user.name "${payload.pusher.name}"`)

    console.log(`try fetch remote`);
    console.log(execSync(`git fetch --prune --unshallow`))
    console.log(`try checkout ${branch}`);
    console.log(execSync(`git checkout ${branch}`));
    console.log(`try create branch ${updateBranch}`);
    console.log(execSync(`git branch ${updateBranch}`));
    console.log(`try checkout branch ${updateBranch}`);
    console.log(execSync(`git checkout ${updateBranch}`));
    console.log(execSync(`git status`));
    for (let i = 0; i < hashesToCherryPick.length; i++) {
      console.log(execSync(`git cherry-pick ${hashesToCherryPick[i]}`));
    }
    console.log(execSync(`git push -v -u origin refs/heads/${updateBranch}:refs/heads/${updateBranch}`));
    //create PR
    const octokit = new github.GitHub(githubToken);
    const { data: currentPulls } = await octokit.pulls.list({
        owner: repository.owner.name,
        repo: repository.name
      });

      const currentPull = currentPulls.find(pull => {
        return pull.head.ref === fromBranch && pull.base.ref === toBranch;
      });

      if (!currentPull) {
        const { data: pullRequest } = await octokit.pulls.create({
          owner: repository.owner.login,
          repo: repository.name,
          head: fromBranch,
          base: toBranch,
          title: pullRequestTitle
            ? pullRequestTitle
            : `sync: ${fromBranch} to ${branch}`,
          body: pullRequestBody
            ? pullRequestBody
            : `Cherry picks commits from ${fromBranch}, to ${branch}!`
        });

        console.log(`Pull request successful! You can view it here: ${pullRequest.url}.`);

      } else {
        console.log(
          `There is already a pull request from ${fromBranch} to ${branch}.`,
          `You can view it here: ${currentPull.url}`
        );
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();