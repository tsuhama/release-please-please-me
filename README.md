# Release Please Please Me
Inspired by Google's release-please and the Beatles...
Automation for more advanced release workflows like managing multiple release branches or backport releases. 

* [Concepts and Workflows](#concepts-and-workflows)
* [Configuration](#configuration)

## Concepts and Workflows
### Semantic Versioning 
### Conventional Commits 
In order to enforce the constraint of single releasable unit per PR, we stick to squash commits. The squash commit follows the pattern of conventional commits to clearly identify the releasable unit of the change introduced for the PR. 
### Support Policies 
Both for major and minor releases, we can declare an individual  `n-x` policy, which will be considered for maintaining stable branches for all supported versions, which should allow us to apply patches to all supported versions for backport releases. If enabled, the plugin will also make sure, to clean up the outdated stable branches out of support range. 

For example, applying the `major-1` on major and `minor-2` on minor policy on following stable branches: 
* `stable-1.1`
* `stable-1.2`
* `stable-1.3`
* `stable-2.1`
* `stable-2.2`
* `stable-2.3`

Release `2.4.0` will result into following stable branches: 
* `stable-1.1`
* `stable-1.2`
* `stable-1.3`
* `stable-2.2`
* `stable-2.3`
* `stable-2.4` (up-to-date with `main`)

Release `3.0.0` will result into following stable branches:
* `stable-2.2`
* `stable-2.3`
* `stable-2.4`
* `stable-3.0` (up-to-date with `main`)

### Backport Releases
Following our support policies, we apply bug fixes and security patches to all stable branches. Once these patches or fixes are applied to the main branch, we create automatically PR's targeting all stable branches, allowing us to apply the release workflow on backport releases. 

### Branches 
Following conventional branches types with configurable naming patterns are used to implement the workflow: 
* Default Branch (`main`): Reflects the latest state of the repository, stable but might contain not yet released changes. 
* Stable Version Branch (`stable-1.2`): Reflects the latest state of the repository for this release line, stable but might contain not yet released changes
* Release Branch (`release-1.3`): Copy of the latest stable or default branch for pending release. The only diff would consist of auto-generated changelog based on conventional commits. Once the release branch is merged to the target (default or stable version branch), the release will be created.

### Sub-Workflows
* Maintenance of stale version branches (create and cleanup)
* Creation of PR's for stable version branches for patches and hotfixes 
* Creation of release PR's for stable version branches from release branches
* Creation of backport releases

## Configuration