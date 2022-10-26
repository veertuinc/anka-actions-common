import * as core from '@actions/core'

const logDecorator =
  (
    logFn: (message: string) => void,
    decFn: (message: string) => string
  ): ((message: string) => void) =>
  (message: string) =>
    logFn(decFn(message))

const dateTimeDecorator = (m: string): string =>
  `[${new Date().toLocaleString()}] ${m}`

export const logDebug = logDecorator(core.debug, dateTimeDecorator)
export const logInfo = logDecorator(core.info, dateTimeDecorator)
export const logError = logDecorator(core.error, dateTimeDecorator)
