export declare class HardTimeoutError extends Error {
}
export declare const sleep: (waitTimeInMs: number) => Promise<void>;
export declare const timeout: (ms: number, message: string) => Promise<void>;
