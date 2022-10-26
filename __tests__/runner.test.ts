import {expect, test} from '@jest/globals'
import {RestEndpointMethods} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types'
import {PaginateInterface} from '@octokit/plugin-paginate-rest'
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import {Octokit} from '@octokit/rest'
import {Runner} from '../src/runner'
import {OctokitResponse} from '@octokit/types'

type mocktype = Octokit & {paginate: PaginateInterface} & RestEndpointMethods &
  Api

test('create token', async () => {
  const mock = {
    actions: {
      createRegistrationTokenForRepo: (
        args: object
      ): Promise<OctokitResponse<any, any>> =>
        new Promise((resolve, reject) => {
          expect(args).toEqual({
            owner: 'owner',
            repo: 'repo'
          })

          const resp: OctokitResponse<any, any> = {
            headers: {},
            status: 0,
            url: '',
            data: {
              token: 'token',
              expires_at: '2020-01-29T12:13:35.123-08:00'
            }
          }
          resolve(resp)
        })
    }
  }

  const runner = new Runner(mock as unknown as mocktype, 'owner', 'repo')
  expect(await runner.createToken()).toEqual('token')
})

test('get runner by action id', async () => {
  const mock = {
    actions: {
      listSelfHostedRunnersForRepo: (
        args: object
      ): Promise<OctokitResponse<any, any>> =>
        new Promise((resolve, reject) => {
          expect(args).toEqual({
            owner: 'owner',
            repo: 'repo'
          })

          const resp: OctokitResponse<any, any> = {
            headers: {},
            status: 0,
            url: '',
            data: {
              total_count: 2,
              runners: [
                {
                  id: 23,
                  name: 'linux_runner',
                  os: 'linux',
                  status: 'online',
                  busy: true,
                  labels: [
                    {
                      id: 5,
                      name: 'self-hosted',
                      type: 'read-only'
                    },
                    {
                      id: 7,
                      name: 'X64',
                      type: 'read-only'
                    }
                  ]
                },
                {
                  id: 24,
                  name: 'mac_runner',
                  os: 'macos',
                  status: 'offline',
                  busy: false,
                  labels: [
                    {
                      id: 5,
                      name: 'self-hosted',
                      type: 'read-only'
                    }
                  ]
                }
              ]
            }
          }
          resolve(resp)
        })
    }
  }

  const runner = new Runner(mock as unknown as mocktype, 'owner', 'repo')
  expect(await runner.getRunnerByName('linux_runner')).toEqual(23)
})

test('delete', async () => {
  const mock = {
    actions: {
      deleteSelfHostedRunnerFromRepo: (args: object): Promise<void> =>
        new Promise((resolve, reject) => {
          expect(args).toEqual({
            owner: 'owner',
            repo: 'repo',
            runner_id: 7
          })

          resolve()
        })
    }
  }

  const runner = new Runner(mock as unknown as mocktype, 'owner', 'repo')
  expect(await runner.delete(7)).toBeUndefined()
})
