"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core = __importStar(require("@actions/core"));
const rest_1 = require("@octokit/rest");
const git_1 = require("../api/git");
const support_1 = require("../core/support");
const version_1 = require("../core/version");
const maintenance_1 = require("../workflows/maintenance");
const backport_1 = require("../workflows/backport");
async function main() {
    const inputs = parseActionInputs();
    const github = createGitOperations(inputs);
    const matcher = createStableVersionBranchMatcher(inputs);
    // run maintenance
    if (!inputs.skipMaintenance) {
        core.info('Running maintenance for stable version branches...');
        const releaseVersion = (0, version_1.parseSemanticVersion)(inputs.latestReleaseVersion);
        const policy = createSupportPolicy(inputs, releaseVersion);
        await (0, maintenance_1.maintainStableVersionBranches)(github, releaseVersion, policy, matcher);
        core.info('Completed maintenance.');
    }
    if (!inputs.skipBackportPRs) {
        core.info("Running backport pull requests creation...");
        //TODO
        await (0, backport_1.backportFixBranch)(github, matcher, "todo");
        core.info('Completed backporting.');
    }
}
function parseActionInputs() {
    return {
        token: core.getInput('token', { required: true }),
        latestReleaseVersion: core.getInput('latest-release-version', { required: true }),
        stableVersionBranchPrefix: core.getInput('stable-version-branch-prefix', { required: true }),
        minorVersionSupportPolicy: parseInt(core.getInput('minor-version-support-policy', { required: true })),
        majorVersionSupportPolicy: parseInt(core.getInput('major-version-support-policy', { required: true })),
        skipMaintenance: core.getBooleanInput('skip-maintenance', { required: true }),
        skipBackportPRs: core.getBooleanInput('skip-backport-pull-requests', { required: true }),
    };
}
function createGitOperations(inputs) {
    const repoUrl = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoUrl.split('/');
    return new git_1.GitHubControl(new rest_1.Octokit({ auth: inputs.token }), { repo: repo, owner: owner, defaultBranch: 'main' });
}
function createSupportPolicy(inputs, latestVersion) {
    return new support_1.NMinusRangeSupportPolicy((0, version_1.toStableVersion)(latestVersion), inputs.majorVersionSupportPolicy, inputs.minorVersionSupportPolicy);
}
function createStableVersionBranchMatcher(inputs) {
    return new maintenance_1.PrefixStableVersionMatcher(inputs.stableVersionBranchPrefix);
}
if (require.main === module) {
    main().catch(err => {
        core.setFailed(`release-please-please-me failed: ${err.message}`);
    });
}
