export class HardTimeoutError extends Error {}

export const sleep = async (waitTimeInMs: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs))

export const timeout = async (ms: number, message: string): Promise<void> =>
  new Promise((_, reject) => {
    const id = setTimeout(() => {
      reject(new HardTimeoutError(message))
    }, ms)
    // let timer to not block Nodejs process to exit naturally
    id.unref()
  })
