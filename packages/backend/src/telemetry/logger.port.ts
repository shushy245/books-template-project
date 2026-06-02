export type LogContext = Record<string, unknown>;

export type LogFields = Record<string, unknown>;

export type LogEntry = {
    level: 'info' | 'warn' | 'error';
    ctx: LogContext;
    message: string;
    fields?: LogFields;
};

export type LoggerPort = {
    info: (ctx: LogContext, message: string, fields?: LogFields) => void;
    warn: (ctx: LogContext, message: string, fields?: LogFields) => void;
    error: (ctx: LogContext, message: string, fields?: LogFields) => void;
};
