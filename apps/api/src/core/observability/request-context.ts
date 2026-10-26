import { AsyncLocalStorage } from 'node:async_hooks';

interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Runs `fn` with this request's id visible to every log line it writes. */
export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

/** The id of the request being handled, if any (none at startup or in jobs). */
export function currentRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}
