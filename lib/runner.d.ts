import { Octokit } from '@octokit/rest';
export declare class Runner {
    private octokit;
    private owner;
    private repo;
    constructor(octokit: Octokit, owner: string, repo: string);
    getRunnerByActionId(actionId: string): Promise<number | null>;
    createToken(): Promise<string>;
    delete(runnerId: number): Promise<void>;
}
