"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubControl = void 0;
class GitHubControl {
    octokit;
    repository;
    constructor(octokit, repository) {
        this.octokit = octokit;
        this.repository = repository;
    }
    async getBranch(branchName) {
        const { data: { object: { sha, url } } } = await this.octokit.git.getRef({
            repo: this.repository.repo,
            owner: this.repository.owner,
            ref: `heads/${branchName}`,
        });
        return {
            name: branchName,
            url: url,
            sha: sha,
        };
    }
    async getTag(tagName) {
        const { data: { object: { sha } } } = await this.octokit.git.getRef({
            repo: this.repository.repo,
            owner: this.repository.owner,
            ref: `tags/${tagName}`,
        });
        return {
            name: tagName,
            sha: sha
        };
    }
    async createBranchFromTag(tag, newBranchName) {
        const { data: { object: { sha, url }, }, } = await this.octokit.git.createRef({
            owner: this.repository.owner,
            repo: this.repository.repo,
            ref: `refs/heads/${newBranchName}`,
            sha: tag.sha,
        });
        return {
            name: newBranchName,
            url: url,
            sha: sha
        };
    }
    async createPullRequest(sourceBranch, targetBranch) {
        return {
            baseBranchName: "",
            number: 0,
            title: '',
            headBranchName: '',
            body: '',
            labels: [],
            files: []
        };
    }
    async deleteBranch(branch) {
        const {} = await this.octokit.git.deleteRef({
            owner: this.repository.owner,
            repo: this.repository.repo,
            ref: branch.sha
        });
    }
    getBranches() {
        return [];
    }
}
exports.GitHubControl = GitHubControl;
