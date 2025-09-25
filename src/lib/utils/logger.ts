// File: src/lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const logger = {
    info: (...args: unknown[]) => {
        console.log('[INFO]', ...args);
    },
    warn: (...args: unknown[]) => {
        console.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]) => {
        console.error('[ERROR]', ...args);
    },
    debug: (...args: unknown[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug('[DEBUG]', ...args);
        }
    },
    log: (...args: unknown[]) => {
        console.log('[LOG]', ...args);
    },
};
export const writeToLogger = (level: LogLevel, ...args: unknown[]) => {
    if (logger[level]) {
        logger[level](...args);
    } else {
        console.warn(`[UNKNOWN LEVEL: ${level}]`, ...args);
    }
};