import {sleep, timeout, HardTimeoutError} from '../lib/timeout'
import {expect, test} from '@jest/globals'

test('sleep 500 ms', async () => {
  const start = new Date()
  await sleep(500)
  const end = new Date()
  const delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

test('timeout 500 ms', async () => {
  const start = new Date()
  await expect(timeout(500, 'hard-timeout!')).rejects.toThrow(
    new HardTimeoutError('hard-timeout!')
  )
  const end = new Date()
  const delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})
