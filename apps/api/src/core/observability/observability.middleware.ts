import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';
import { AppVersionTracker } from './app-version-tracker.service';
import { runWithRequestId } from './request-context';
import { requestMetrics } from './request-metrics';

// The testing portal polls itself every few seconds; counting that would
// drown the real traffic
const UNTRACKED = /^\/testing-portal\//;

/**
 * Gives each request an id (X-Request-Id, also on every log line it
 * writes), times it into the request metrics by route template, and notes
 * the app build that sent it.
 */
@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  constructor(private readonly versions: AppVersionTracker) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-request-id'];
    const requestId =
      (typeof incoming === 'string' && /^[\w-]{1,64}$/.test(incoming)
        ? incoming
        : null) ?? randomUUID().slice(0, 8);
    res.setHeader('X-Request-Id', requestId);

    if (!UNTRACKED.test(req.originalUrl)) {
      const start = performance.now();
      res.on('finish', () => {
        const route = req.route?.path
          ? `${req.method} ${req.baseUrl}${req.route.path as string}`
          : `${req.method} (no route)`;
        requestMetrics.record(route, res.statusCode, performance.now() - start);
      });
      this.versions.note(req.headers);
    }

    runWithRequestId(requestId, next);
  }
}
