const MINUTE = 60_000;
const WINDOW_MINUTES = 24 * 60;
// Durations kept per minute for the percentiles; enough at this traffic
const SAMPLES_PER_MINUTE = 500;

interface MinuteBucket {
  minute: number;
  requests: number;
  clientErrors: number;
  serverErrors: number;
  durations: number[];
}

interface RouteStats {
  requests: number;
  serverErrors: number;
  clientErrors: number;
  totalMs: number;
  maxMs: number;
}

export interface MetricsSnapshot {
  windowMinutes: number;
  totals: {
    requests: number;
    clientErrors: number;
    serverErrors: number;
    p50Ms: number | null;
    p95Ms: number | null;
  };
  // One point per minute (oldest first), for the chart
  perMinute: {
    at: string;
    requests: number;
    serverErrors: number;
    p95Ms: number | null;
  }[];
  slowestRoutes: {
    route: string;
    avgMs: number;
    maxMs: number;
    requests: number;
  }[];
  failingRoutes: {
    route: string;
    serverErrors: number;
    clientErrors: number;
    requests: number;
  }[];
}

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  const value =
    sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  return Math.round(value);
}

/**
 * Request counts, errors and latency for the last 24 hours, by minute and
 * by route template (`GET /users/:id`, never the raw URL). In memory: a
 * restart starts again from zero.
 */
class RequestMetrics {
  private buckets: MinuteBucket[] = [];
  private routes = new Map<string, RouteStats>();
  private routesSince = Date.now();

  record(
    route: string,
    status: number,
    durationMs: number,
    now = Date.now(),
  ): void {
    const minute = Math.floor(now / MINUTE) * MINUTE;
    let bucket = this.buckets[this.buckets.length - 1];
    if (!bucket || bucket.minute !== minute) {
      bucket = {
        minute,
        requests: 0,
        clientErrors: 0,
        serverErrors: 0,
        durations: [],
      };
      this.buckets.push(bucket);
      const oldest = minute - WINDOW_MINUTES * MINUTE;
      while (this.buckets.length && this.buckets[0].minute <= oldest)
        this.buckets.shift();
    }
    bucket.requests++;
    if (status >= 500) bucket.serverErrors++;
    else if (status >= 400) bucket.clientErrors++;
    if (bucket.durations.length < SAMPLES_PER_MINUTE)
      bucket.durations.push(durationMs);

    // Per-route totals restart every 24 hours
    if (now - this.routesSince > WINDOW_MINUTES * MINUTE) {
      this.routes.clear();
      this.routesSince = now;
    }
    const stats = this.routes.get(route) ?? {
      requests: 0,
      serverErrors: 0,
      clientErrors: 0,
      totalMs: 0,
      maxMs: 0,
    };
    stats.requests++;
    if (status >= 500) stats.serverErrors++;
    else if (status >= 400) stats.clientErrors++;
    stats.totalMs += durationMs;
    stats.maxMs = Math.max(stats.maxMs, durationMs);
    this.routes.set(route, stats);
  }

  snapshot(minutes = 60, now = Date.now()): MetricsSnapshot {
    const since = Math.floor(now / MINUTE) * MINUTE - (minutes - 1) * MINUTE;
    const recent = this.buckets.filter((b) => b.minute >= since);
    const all = recent.flatMap((b) => b.durations).sort((a, b) => a - b);
    const routes = [...this.routes.entries()];
    return {
      windowMinutes: minutes,
      totals: {
        requests: recent.reduce((n, b) => n + b.requests, 0),
        clientErrors: recent.reduce((n, b) => n + b.clientErrors, 0),
        serverErrors: recent.reduce((n, b) => n + b.serverErrors, 0),
        p50Ms: percentile(all, 50),
        p95Ms: percentile(all, 95),
      },
      perMinute: recent.map((b) => ({
        at: new Date(b.minute).toISOString(),
        requests: b.requests,
        serverErrors: b.serverErrors,
        p95Ms: percentile(
          [...b.durations].sort((x, y) => x - y),
          95,
        ),
      })),
      slowestRoutes: routes
        .map(([route, s]) => ({
          route,
          avgMs: Math.round(s.totalMs / s.requests),
          maxMs: Math.round(s.maxMs),
          requests: s.requests,
        }))
        .sort((a, b) => b.avgMs - a.avgMs)
        .slice(0, 10),
      failingRoutes: routes
        .filter(([, s]) => s.serverErrors + s.clientErrors > 0)
        .map(([route, s]) => ({
          route,
          serverErrors: s.serverErrors,
          clientErrors: s.clientErrors,
          requests: s.requests,
        }))
        .sort(
          (a, b) =>
            b.serverErrors - a.serverErrors || b.clientErrors - a.clientErrors,
        )
        .slice(0, 10),
    };
  }

  clearForTests(): void {
    this.buckets = [];
    this.routes.clear();
    this.routesSince = Date.now();
  }
}

export const requestMetrics = new RequestMetrics();
