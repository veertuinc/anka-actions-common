import {Octokit} from '@octokit/rest'

export class Runner {
  private octokit: Octokit
  private owner: string
  private repo: string

  constructor(auth: string, owner: string, repo: string) {
    this.octokit = new Octokit({auth})
    this.owner = owner
    this.repo = repo
  }

  async getRunnerByActionId(actionId: string): Promise<number | null> {
    const runnerListResp =
      await this.octokit.actions.listSelfHostedRunnersForRepo({
        owner: this.owner,
        repo: this.repo
      })

    const found = runnerListResp.data.runners.filter(
      runner => runner.name === actionId
    )

    if (found.length) {
      return found[0].id
    }

    return null
  }

  async createToken(): Promise<string> {
    const tokenResp = await this.octokit.actions.createRegistrationTokenForRepo(
      {
        owner: this.owner,
        repo: this.repo
      }
    )

    return tokenResp.data.token
  }

  async delete(runnerId: number): Promise<void> {
    await this.octokit.actions.deleteSelfHostedRunnerFromRepo({
      owner: this.owner,
      repo: this.repo,
      runner_id: runnerId
    })
  }
}
