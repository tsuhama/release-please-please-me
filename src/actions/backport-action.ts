import * as core from '@actions/core'
import {backportFixBranch} from "../workflows/backport";
import {GitControl, GitHubControl} from "../api/git";
import {Octokit} from "@octokit/rest";
import {PrefixStableVersionMatcher, StableVersionMatcher} from "../workflows/maintenance";
export async function main() {
    const inputs = parseActionInputs()
    const github = createGitOperations(inputs);
    const matcher = createStableVersionBranchMatcher(inputs);
    core.info(`Creating backport pull requests for fix branch ${inputs.sourceBranch}.`);
    await backportFixBranch(github, matcher, inputs.sourceBranch);
    core.info('Completed with creation of backport pull requests.');
}

interface ActionInputs {
    readonly token: string,
    readonly stableVersionBranchPrefix: string,
    readonly sourceBranch: string
}

function parseActionInputs(): ActionInputs {
    return {
        token: core.getInput('', { required: true }),
        stableVersionBranchPrefix: core.getInput('stable-version-branch-prefix', { required: true }),
        sourceBranch: core.getInput('source-branch', { required: true })
    };
}

function createGitOperations(inputs: ActionInputs): GitControl {
    const repoUrl = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoUrl.split('/');
    return new GitHubControl(new Octokit({ auth: inputs.token }), { repo: repo, owner: owner, defaultBranch: 'main'});
}

function createStableVersionBranchMatcher(inputs: ActionInputs): StableVersionMatcher {
    return new PrefixStableVersionMatcher(inputs.stableVersionBranchPrefix);
}