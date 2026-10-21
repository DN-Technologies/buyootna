# Deploys without downtime

## Problem
Every `cd.yml` deploy takes the API (and the web sites) offline for a short
time. QA hit it on 2026-10-21: the deploy recreated `buyootna-api-1` at
12:51:42 UTC, and a plan purchase at 15:52 Kuwait time got
"Request failed with status code 502".

Why: the last step, `docker compose up -d`, stops the old container and
then starts the new one. Until Nest has booted (Prisma connect, GeoIP load,
modules), nginx has nothing to forward to and answers 502. Nothing checks
that the new API is actually up: there is no health endpoint and no
container healthcheck.

## Approach: start the new container next to the old one, then switch
On one host with Compose this is the standard "scale to two, wait until
healthy, remove the old" rollout. nginx already finds the API through
Docker's DNS (`resolver 127.0.0.11`, `set $upstream http://api:8000`), so
while there are two containers it sends requests to both.

### 1. API: a health endpoint and a clean shutdown
- `GET /health`: no auth, no throttling; 200 once the app is listening and
  the database answers `SELECT 1`, otherwise 503. It stays out of Swagger
  and the logs.
- Call `app.enableShutdownHooks()` in `main.ts` (Prisma already has a
  hook), so on SIGTERM the server stops accepting connections, finishes the
  requests in flight, and disconnects.

### 2. Compose
- `api`: a `healthcheck` on `/health` (interval 5s, retries 6,
  start_period 60s) and `stop_grace_period: 30s`.
- The same for each Next.js site, using `/`. This can be done later; those
  sites matter less than the API.

### 3. nginx (`api.*.conf`)
- `resolver 127.0.0.11 valid=5s`, so a removed container stops getting
  traffic within seconds (today it can take up to 30s).
- `proxy_next_upstream error timeout http_502;` and
  `proxy_next_upstream_tries 2;`: a request that reaches a container while
  it shuts down is retried on the other one. Only GET/HEAD are retried by
  default; POSTs such as payments are never sent twice.

### 4. `cd.yml`: roll the API instead of recreating it
In place of the plain `docker compose up -d` for `api`:
1. `docker compose up -d --no-deps --no-recreate --scale api=2 api`: the
   new image starts beside the old container.
2. Wait until the new container is `healthy` (fail the deploy after about
   2 minutes and remove the new container, leaving the old one serving).
3. Wait about 10s (longer than the nginx DNS cache), then
   `docker stop -t 30` and `docker rm` the old container.
4. `docker compose up -d --no-deps --scale api=1 --no-recreate api`.

Other services keep `docker compose up -d` for now. The
[docker-rollout](https://github.com/wowu/docker-rollout) plugin does steps
1–4 in one command and can be used instead of the hand-written steps.

## Things to watch
- **Scheduled jobs:** for the 10–60s while two API containers run, a
  `@Cron` job (e.g. the weekly GeoIP refresh) could run twice. Check that
  each job is safe to run twice, or skip crons on the new container until
  the old one is gone.
- **Memory:** two API containers at once on the 7.8 GiB box. The API is
  small next to the Next.js builds, which already run one at a time.
- **Migrations** still run before the new containers start, as today. Any
  migration has to work with the old API still running: add columns first,
  drop them in a later release. Today's migrations already follow this.

## Checking it
- Staging-style dry run on the server: deploy while a loop calls
  `GET /plans` every 200 ms. It should never get a 502. Today it does, for
  several seconds.
- A deploy that brings up an API that won't start: the deploy fails and the
  old API keeps serving.

## Until this ships
Avoid running `cd.yml` while QA is testing, or tell them before deploying.
