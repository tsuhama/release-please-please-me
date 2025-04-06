import {Branch, GitControl} from "../api/git";
import {SemanticVersion, StableVersion, toStableVersion} from "../core/version";
import {SupportPolicy} from "../core/support";

// should be executed on creation of LATEST release and NOT on backport releases
export async function maintainStableVersionBranches(
    git: GitControl,
    releasedVersion: SemanticVersion,
    supportPolicy: SupportPolicy,
    staleVersionMatcher: StableVersionMatcher
) {
    console.info(`Running stable version maintenance for latest release ${releasedVersion}`)
    const releaseTag = await git.getTag(`${releasedVersion.major}.${releasedVersion.minor}.${releasedVersion.patch}`);
    // create stable-version branch for newly released version
    console.info(`creating stable version branch for release tag ${releaseTag.name} with sha ${releaseTag.sha}`);
    const stableVersion = toStableVersion(releasedVersion);
    const stableVersionBranch = await git.createBranchFromTag(releaseTag, `stable-${stableVersion.major}.${stableVersion.minor}`)
    console.info(`successfully created stable version branch ${stableVersionBranch.name} with sha ${stableVersionBranch.sha}`);
    // delete all stable-version branches based on support policy config
    git.getBranches()
        .map(it => toStaleVersionBranch(staleVersionMatcher, it))
        .filter( it => it !== null)
        .filter(it => !supportPolicy.supports(it?.version))
        .forEach(it => {
            console.info(`Deleting branch ${it?.branch.name} with sha ${it?.branch.sha} for unsupported stable version ${it?.version.major}.${it?.version.minor}.`)
            git.deleteBranch(it?.branch)
        })
    console.info('Stable version maintenance completed.')
}

interface StableVersionBranch {
    readonly branch: Branch
    readonly version: StableVersion
}

export interface StableVersionMatcher {
    matches(branch: Branch): boolean
    getVersion(name: Branch): StableVersion
}

export class PrefixStableVersionMatcher implements StableVersionMatcher{

    constructor(readonly prefix: string) {
    }

    matches(branch: Branch): boolean {
        return branch.name.startsWith(this.prefix);
    }
    getVersion(branch: Branch): StableVersion {
        if (!this.matches(branch)) {
           throw Error('does not match pattern')
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

function toStaleVersionBranch(matcher: StableVersionMatcher, branch: Branch): StableVersionBranch | null {
    if (matcher.matches(branch)) {
        return {
            branch: branch,
            version: matcher.getVersion(branch)
        }
    } else {
        return null
    }
}