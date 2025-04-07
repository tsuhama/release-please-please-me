"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefixStableVersionMatcher = void 0;
exports.maintainStableVersionBranches = maintainStableVersionBranches;
exports.getStableVersionBranches = getStableVersionBranches;
const version_1 = require("../core/version");
// should be executed on creation of LATEST release and NOT on backport releases
async function maintainStableVersionBranches(git, releasedVersion, supportPolicy, staleVersionMatcher) {
    console.info(`running stable version maintenance for latest release ${releasedVersion}`);
    const releaseTag = await git.getTag(`${releasedVersion.major}.${releasedVersion.minor}.${releasedVersion.patch}`);
    // create stable-version branch for newly released version
    console.info(`creating stable version branch for release tag ${releaseTag.name} with sha ${releaseTag.sha}`);
    const stableVersion = (0, version_1.toStableVersion)(releasedVersion);
    const stableVersionBranch = await git.createBranchFromTag(releaseTag, `stable-${stableVersion.major}.${stableVersion.minor}`);
    console.info(`successfully created stable version branch ${stableVersionBranch.name} with sha ${stableVersionBranch.sha}`);
    // delete all stable-version branches based on support policy config
    const stableVersionBranches = await getStableVersionBranches(git, staleVersionMatcher);
    stableVersionBranches
        .filter(it => !supportPolicy.supports(it?.version))
        .forEach(it => {
        console.info(`deleting branch ${it?.branch.name} with sha ${it?.branch.sha} for unsupported stable version ${it?.version.major}.${it?.version.minor}.`);
        git.deleteBranch(it?.branch);
    });
    console.info('stable version maintenance completed.');
}
async function getStableVersionBranches(git, matcher) {
    return git.getBranches()
        .map(it => toStaleVersionBranch(matcher, it))
        .filter(it => it !== null);
}
class PrefixStableVersionMatcher {
    prefix;
    constructor(prefix) {
        this.prefix = prefix;
    }
    matches(branch) {
        return branch.name.startsWith(this.prefix);
    }
    getVersion(branch) {
        if (!this.matches(branch)) {
            throw Error('does not match pattern');
        }
        const versionString = branch.name.replace(this.prefix, "");
        const majorVersionString = versionString.substring(0, versionString.indexOf('.'));
        const minorVersionString = versionString.substring(versionString.indexOf('.') + 1, versionString.length);
        return {
            major: parseInt(majorVersionString),
            minor: parseInt(minorVersionString),
        };
    }
}
exports.PrefixStableVersionMatcher = PrefixStableVersionMatcher;
function toStaleVersionBranch(matcher, branch) {
    if (matcher.matches(branch)) {
        return {
            branch: branch,
            version: matcher.getVersion(branch)
        };
    }
    else {
        return null;
    }
}
