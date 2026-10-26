import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { currentRequestId } from './request-context';

export interface LogEntry {
  id: number;
  at: string;
  level: LogLevel;
  context: string | null;
  message: string;
  requestId: string | null;
  stack: string | null;
}

export interface LogQuery {
  level?: LogLevel;
  context?: string;
  q?: string;
  // Only entries newer than this id (the tail view polls with the last one)
  after?: number;
  limit?: number;
}

const CAPACITY = 3000;

/**
 * The newest log lines, kept in memory for the testing portal's السجلات
 * screen. A restart clears it; the full history stays in `docker compose
 * logs` (stdout).
 */
class LogBuffer {
  private entries: LogEntry[] = [];
  private nextId = 1;

  push(entry: Omit<LogEntry, 'id'>): void {
    this.entries.push({ ...entry, id: this.nextId++ });
    if (this.entries.length > CAPACITY) this.entries.shift();
  }

  query({ level, context, q, after, limit = 200 }: LogQuery = {}): LogEntry[] {
    const text = q?.toLowerCase();
    const matches = this.entries.filter(
      (e) =>
        (!level || e.level === level) &&
        (!context || e.context === context) &&
        (after === undefined || e.id > after) &&
        (!text ||
          e.message.toLowerCase().includes(text) ||
          e.requestId === q ||
          (e.stack?.toLowerCase().includes(text) ?? false)),
    );
    return matches.slice(-limit).reverse();
  }

  /** The contexts seen so far, for the screen's filter. */
  contexts(): string[] {
    return [
      ...new Set(this.entries.map((e) => e.context).filter(Boolean)),
    ] as string[];
  }

  clearForTests(): void {
    this.entries = [];
    this.nextId = 1;
  }
}

export const logBuffer = new LogBuffer();

function toText(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

/**
 * Nest's console logger that also keeps each line (with the request id it
 * belongs to) in the log buffer. Set with `app.useLogger` in main.ts.
 */
export class BufferedLogger extends ConsoleLogger {
  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
    errorStack?: unknown,
  ): void {
    const requestId = currentRequestId() ?? null;
    for (const message of messages) {
      logBuffer.push({
        at: new Date().toISOString(),
        level: logLevel,
        context: context || null,
        message: toText(message),
        requestId,
        stack:
          typeof errorStack === 'string'
            ? errorStack
            : message instanceof Error
              ? (message.stack ?? null)
              : null,
      });
    }
    super.printMessages(
      messages,
      requestId && context ? `${context} ${requestId}` : context,
      logLevel,
      writeStreamType,
      errorStack,
    );
  }
}
