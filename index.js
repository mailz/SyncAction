const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const branch = core.getInput("BRANCH", { required: true });

    const payload = github.context.payload;
    const merged = payload.pull_request.merged;
    const repository = payload.repository;

    // console.log(`\npayload.pull_request: `+ JSON.stringify(payload.pull_request, undefined, 2));
    // console.log(`\npayload.repository: `+ JSON.stringify(payload.repository, undefined, 2));

    if (!merged) {
      console.log(`PR isn't merged. stop sync`);
      return;
    }
    const head = payload.pull_request.head.sha;
    const fromBranch = payload.pull_request.base.ref;

    let updateBranch = `update/update_to_${head}`;
    console.log(`update branch is: ${updateBranch}`);

    //move commits
    const { execSync } = require(`child_process`);
    //set user 
    console.log(`update user to login: ci@litres.ru, mail: ci_litres`);
    execSync(`git config --global user.email "ci@litres.ru"`)
    execSync(`git config --global user.name "ci_litres"`)

    console.log(`git update repository`)
    // execSync(`git fetch --prune --unshallow`);
    execSync(`git checkout ${head}`);
    execSync(`git branch ${updateBranch}`);
    execSync(`git checkout ${updateBranch}`);
    console.log(execSync(`git status`));
    console.log(`update remote branch: ${updateBranch}`);
    execSync(`git push -v -u origin refs/heads/${updateBranch}:refs/heads/${updateBranch}`);
    // //create PR
    const octokit = new github.GitHub(githubToken);
    const { data: currentPulls } = await octokit.pulls.list({
        owner: repository.owner.login,
        repo: repository.name
      });

    const currentPull = currentPulls.find(pull => {
      return pull.head.ref === updateBranch && pull.base.ref === branch;
    });

    if (!currentPull) {
      const { data: pullRequest } = await octokit.pulls.create({
          owner: repository.owner.login,
          repo: repository.name,
          head: updateBranch,
          base: branch,
          title: `Sync PR: update ${branch} to ${fromBranch}`,
          body: `Cherry picks commits from ${fromBranch} to ${branch}`
        });

        console.log(`Pull request successful! You can view it here: ${pullRequest.url}.`);

    } else {
      console.log(
          `There is already a pull request from ${updateBranch} to ${branch}.`,
          `You can view it here: ${currentPull.url}`
        );
      }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();