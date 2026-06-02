// main.ts — composition root.
// This is the only place real adapters are wired.
// buildApp() takes deps and remains testable without this file.
import { buildApp } from './app.js';

// TODO (S8 T8.1): replace with the real OTel-backed structured logger.
// For now, a console-based shim that honours the Logger port contract.
const logger = {
  info: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
    console.log(JSON.stringify({ level: 'info', ...ctx, message, ...fields }));
  },
  warn: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
    console.warn(JSON.stringify({ level: 'warn', ...ctx, message, ...fields }));
  },
  error: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
    console.error(JSON.stringify({ level: 'error', ...ctx, message, ...fields }));
  },
};

const app = buildApp({ logger });
const port = Number(process.env['PORT'] ?? 3000);

app.listen(port, () => {
  logger.info({ port }, 'main: server started');
});
