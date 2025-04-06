// Instance per repository
import { Octokit } from "@octokit/rest";

export interface GitControl {
    getBranches(): Branch[]
    getBranch(branchName: string): Promise<Branch>
    getTag(tagName: string): Promise<Tag>
    createBranchFromTag(tag: Tag, newBranchName: string): Promise<Branch>
    deleteBranch(branch: Branch): Promise<void>
    createPullRequest(sourceBranch: Branch, targetBranch: Branch): Promise<PullRequest>
}

export interface Repository {
    readonly owner: string;
    readonly repo: string;
    readonly defaultBranch: string;
}

export interface Commit {
    sha: string;
    message: string;
    files?: string[];
    pullRequest?: PullRequest;
}

export interface Branch {
    readonly name: string
    readonly sha: string,
    readonly url: string
}

export interface Tag {
    name: string,
    sha: string,
}

export interface PullRequest {
    readonly headBranchName: string;
    readonly baseBranchName: string;
    readonly number: number;
    readonly mergeCommitOid?: string;
    readonly title: string;
    readonly body: string;
    readonly labels: string[];
    readonly files: string[];
    readonly sha?: string;
}

export class GitHubControl implements GitControl {

    constructor(readonly octokit: Octokit, readonly repository: Repository) {}

    async getBranch(branchName: string): Promise<Branch> {
        const {
            data: {
                object: { sha, url }
            }
        } = await this.octokit.git.getRef({
            repo: this.repository.repo,
            owner: this.repository.owner,
            ref: `heads/${branchName}`,
        })
        return {
            name: branchName,
            url: url,
            sha: sha,
        }
    }

    async getTag(tagName: string): Promise<Tag> {
        const {
            data: {
                object: { sha }
            }
        } = await this.octokit.git.getRef({
            repo: this.repository.repo,
            owner: this.repository.owner,
            ref: `tags/${tagName}`,
        })
        return {
            name: tagName,
            sha: sha
        }
    }

    async createBranchFromTag(tag: Tag, newBranchName: string): Promise<Branch> {
        const {
            data: {
                object: {sha, url},
            },
        } = await this.octokit.git.createRef({
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

    async createPullRequest(sourceBranch: Branch, targetBranch: Branch): Promise<PullRequest> {
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

    async deleteBranch(branch: Branch): Promise<void> {
        const {} = await this.octokit.git.deleteRef({
            owner: this.repository.owner,
            repo: this.repository.repo,
            ref: branch.sha
        })
    }

    getBranches(): Branch[] {
        return [];
    }

}