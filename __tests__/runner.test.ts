import {Octokit} from '@octokit/rest'
import {Runner} from '../src/runner'
import {expect, test} from '@jest/globals'

test('starts VM successfully', async () => {
  const octokit = jest.mock('@octokit/rest')
  const runner = new Runner(octokit, 'owner', 'repo')
})

