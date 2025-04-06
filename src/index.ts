import * as core from '@actions/core'
import {Octokit} from "@octokit/rest";
import {GitControl, GitHubControl} from "./api/git";
import {NMinusRangeSupportPolicy, SupportPolicy} from "./core/support";
import {parseSemanticVersion, SemanticVersion, toStableVersion} from "./core/version";
import {maintainStableVersionBranches, PrefixStableVersionMatcher, StableVersionMatcher} from "./workflows/maintenance";

export async function main() {
    const inputs = parseActionInputs();
    const releaseVersion = parseSemanticVersion(inputs.latestReleaseVersion);
    const github = createGitOperations(inputs);
    const policy = createSupportPolicy(inputs, releaseVersion);
    const matcher = createStableVersionBranchMatcher(inputs);
    // run maintenance
    core.info("Running maintenance for stable version branches")
    await maintainStableVersionBranches(github, releaseVersion, policy, matcher);
    core.info("Completed maintenance.")
}

interface ActionInputs {
    readonly token: string,
    readonly latestReleaseVersion: string,
    readonly stableVersionBranchPrefix: string,
    readonly minorVersionSupportPolicy: number,
    readonly majorVersionSupportPolicy: number
}

function parseActionInputs(): ActionInputs {
    return {
        token: core.getInput('token', { required: true }),
        latestReleaseVersion: core.getInput('latest-release-version', { required: true }),
        stableVersionBranchPrefix: core.getInput('stable-version-branch-prefix', { required: true }),
        minorVersionSupportPolicy: parseInt(core.getInput('minor-version-support-policy', { required: true })),
        majorVersionSupportPolicy: parseInt(core.getInput('major-version-support-policy', { required: true })),
    };
}

function createGitOperations(inputs: ActionInputs): GitControl {
    const repoUrl = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoUrl.split('/');
    return new GitHubControl(new Octokit({ auth: inputs.token }), { repo: repo, owner: owner, defaultBranch: 'main'});
}

function createSupportPolicy(inputs: ActionInputs, latestVersion: SemanticVersion): SupportPolicy {
    return new NMinusRangeSupportPolicy(
        toStableVersion(latestVersion),
        inputs.majorVersionSupportPolicy,
        inputs.minorVersionSupportPolicy
    );
}

function createStableVersionBranchMatcher(inputs: ActionInputs): StableVersionMatcher {
    return new PrefixStableVersionMatcher(inputs.stableVersionBranchPrefix);
}

if (require.main === module) {
    main().catch(err => {
        core.setFailed(`release-please-please-me failed: ${err.message}`)
    })
}