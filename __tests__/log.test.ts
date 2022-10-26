import * as core from '@actions/core'
const spyDebug = jest.spyOn(core, 'debug')
const spyInfo = jest.spyOn(core, 'info')
const spyError = jest.spyOn(core, 'error')

import {expect, test} from '@jest/globals'
import {logDebug, logError, logInfo} from '../lib/log'

beforeEach(() => {
  jest.clearAllMocks()
  jest.useFakeTimers().setSystemTime(new Date(2020, 0, 1, 0, 0, 0, 0))
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

test('can log debug', async () => {
  logDebug('message')
  expect(spyDebug).toHaveBeenCalledWith('[1/1/2020, 12:00:00 AM] message')
})

test('can log info', async () => {
  logInfo('message')
  expect(spyInfo).toHaveBeenCalledWith('[1/1/2020, 12:00:00 AM] message')
})

test('can log error', async () => {
  logError('message')
  expect(spyError).toHaveBeenCalledWith('[1/1/2020, 12:00:00 AM] message')
})
