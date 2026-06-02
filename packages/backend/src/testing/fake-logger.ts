import { LogEntry, LogFields, Logger } from '../telemetry/logger.port.js';

// `exactOptionalPropertyTypes` forbids setting an optional property to `undefined` explicitly.
// We use a conditional spread so `fields` is only included in the entry when actually provided.
const makeEntry = (
    level: LogEntry['level'],
    ctx: LogEntry['ctx'],
    message: string,
    fields: LogFields | undefined,
): LogEntry => ({
    level,
    ctx,
    message,
    ...(fields !== undefined ? { fields } : {}),
});

export const makeFakeLogger = (): Logger & { entries: LogEntry[] } => {
    const entries: LogEntry[] = [];

    return {
        entries,
        info: (ctx, message, fields) => {
            entries.push(makeEntry('info', ctx, message, fields));
        },
        warn: (ctx, message, fields) => {
            entries.push(makeEntry('warn', ctx, message, fields));
        },
        error: (ctx, message, fields) => {
            entries.push(makeEntry('error', ctx, message, fields));
        },
    };
};
