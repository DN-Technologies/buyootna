import { BufferedLogger, logBuffer } from './log-buffer';
import { requestMetrics } from './request-metrics';
import { runWithRequestId } from './request-context';
import { AppVersionTracker } from './app-version-tracker.service';

describe('logBuffer + BufferedLogger', () => {
  beforeEach(() => logBuffer.clearForTests());

  it('keeps each line with its level, context and the request it belongs to', () => {
    const logger = new BufferedLogger();
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.spyOn(process.stderr, 'write').mockImplementation(() => true);

    runWithRequestId('req-1', () =>
      logger.warn('Slow query', 'PropertiesService'),
    );
    logger.error('Boom', 'stack line', 'ChatGateway');

    const [error, warn] = logBuffer.query();
    expect(warn).toMatchObject({
      level: 'warn',
      context: 'PropertiesService',
      message: 'Slow query',
      requestId: 'req-1',
    });
    expect(error).toMatchObject({
      level: 'error',
      message: 'Boom',
      stack: 'stack line',
    });
    jest.restoreAllMocks();
  });

  it('filters by level, text or request id, and tails after an id', () => {
    logBuffer.push({
      at: '',
      level: 'log',
      context: 'A',
      message: 'hello',
      requestId: 'r1',
      stack: null,
    });
    logBuffer.push({
      at: '',
      level: 'error',
      context: 'B',
      message: 'failed upload',
      requestId: 'r2',
      stack: null,
    });

    expect(logBuffer.query({ level: 'error' }).map((e) => e.message)).toEqual([
      'failed upload',
    ]);
    expect(logBuffer.query({ q: 'UPLOAD' })).toHaveLength(1);
    expect(logBuffer.query({ q: 'r1' })[0].message).toBe('hello');
    expect(logBuffer.query({ after: 1 }).map((e) => e.id)).toEqual([2]);
    expect(logBuffer.contexts()).toEqual(['A', 'B']);
  });
});

describe('requestMetrics', () => {
  beforeEach(() => requestMetrics.clearForTests());

  it('sums requests, errors and percentiles per minute and route', () => {
    const now = Date.UTC(2026, 9, 26, 12, 0, 30);
    requestMetrics.record('GET /users/:id', 200, 40, now);
    requestMetrics.record('GET /users/:id', 200, 60, now);
    requestMetrics.record('POST /stories', 500, 900, now);
    requestMetrics.record('POST /auth/login', 401, 20, now - 120_000);

    const snap = requestMetrics.snapshot(60, now);
    expect(snap.totals).toMatchObject({
      requests: 4,
      clientErrors: 1,
      serverErrors: 1,
    });
    expect(snap.totals.p95Ms).toBe(900);
    expect(snap.perMinute).toHaveLength(2);
    expect(snap.slowestRoutes[0]).toMatchObject({
      route: 'POST /stories',
      avgMs: 900,
    });
    expect(snap.failingRoutes[0]).toMatchObject({
      route: 'POST /stories',
      serverErrors: 1,
    });
  });

  it('drops minutes older than 24 hours', () => {
    const now = Date.UTC(2026, 9, 26, 12, 0, 0);
    requestMetrics.record('GET /a', 200, 5, now - 25 * 60 * 60_000);
    requestMetrics.record('GET /a', 200, 5, now);
    expect(requestMetrics.snapshot(1440, now).totals.requests).toBe(1);
  });
});

describe('AppVersionTracker', () => {
  it('counts requests per build and writes them in one flush', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const tracker = new AppVersionTracker({
      appVersionSeen: { upsert },
    } as never);

    tracker.note({
      'x-platform': 'ios',
      'x-app-version': '1.7.0',
      'x-app-runtime': '1.7.0',
    });
    tracker.note({
      'x-platform': 'ios',
      'x-app-version': '1.7.0',
      'x-app-runtime': '1.7.0',
    });
    tracker.note({ 'x-platform': 'android', 'x-app-version': '1.6.2' });
    tracker.note({}); // a browser: nothing to count
    await tracker.flush();

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          platform_appVersion_runtime: {
            platform: 'ios',
            appVersion: '1.7.0',
            runtime: '1.7.0',
          },
        },
        update: expect.objectContaining({ requests: { increment: 2 } }),
      }),
    );
    await tracker.flush();
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it('strips anything but plain version characters from the headers', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const tracker = new AppVersionTracker({
      appVersionSeen: { upsert },
    } as never);
    tracker.note({
      'x-platform': 'ios<script>',
      'x-app-version': '1.7.0; DROP',
    });
    await tracker.flush();
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      platform: 'iosscript',
      appVersion: '1.7.0DROP',
    });
  });
});
