# Release Policy

Read this for anything release-, OTA-, native-build-, or version-related —
or any change that's production-impacting more generally.

The detailed, authoritative process docs already exist and are not
duplicated here — read them directly for the actual mechanics:

- **[`docs/OTA_RELEASE_WORKFLOW.md`](../OTA_RELEASE_WORKFLOW.md)** — what
  can ship as an OTA update vs. what needs a new native build, channels,
  how to run `release-ota.js`, rollback.
- **[`apps/mobile/VERSIONING.md`](../../apps/mobile/VERSIONING.md)** — the
  semver decision rules (MAJOR/MINOR/PATCH), already written for an AI to
  follow directly; use it whenever a change needs a version bump.

## Two rules not yet written down anywhere else — do not regress these

Both were discovered and fixed the hard way in this repo's history.
Reintroducing either will break production again.

### 1. `app.config.ts`'s `version` is authoritative, not `package.json`'s

`apps/mobile` currently has two different, drifted version numbers:
`package.json`'s `version` and `app.config.ts`'s `version`. **Only
`app.config.ts`'s value matters for `runtimeVersion`/OTA compatibility**
— it's what `release-ota.js` reads, and what Expo derives the runtime
version from (`runtimeVersion: { policy: 'appVersion' }`). When following
`VERSIONING.md`'s rules to bump a version, bump `app.config.ts`. Don't
assume `package.json`'s version reflects the real shipped app version —
it doesn't right now.

### 2. `eas update` does not read `eas.json` build-profile env — `release-ota.js` must be the only path

Unlike `eas build`, `eas update` does **not** apply `eas.json`'s
`build.<profile>.env` block. Run it directly (or a naive wrapper around
it) and it silently bundles JS using whatever the invoking shell/local
`.env` already has — which in this repo is deliberately pointed at
`localhost:8000` for day-to-day API development, and has
`EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS=true` for local company-feature dev.

`apps/mobile/scripts/release-ota.js` is "the only place in this repo
allowed to run `eas update`" for exactly this reason: it force-neutralizes
every local `.env` key not explicitly present in the target channel's
`eas.json` build-profile env, hard-fails if the resolved API URL still
looks local, and clears Metro's bundler cache (which was independently
found to cache a stale inlined env value across publishes even after the
env override was correct). **Any change to this script must preserve all
three of those protections.** This exact gap — a publish silently
shipping `localhost:8000` or leaking a dev-only feature flag to
production — has already happened multiple times before these checks
existed; don't reintroduce a path around them.

## For the next native build: reel links opening the app

A shared `https://buyootna.cloud/reels/:id` opens the website, whose «فتح في
التطبيق» uses the `buyootnamobile://` scheme. For the link itself to open the
app, a new binary must add `associatedDomains` (iOS) and an `intentFilters`
entry (Android) to `app.config.ts`, and the landing site must serve
`/.well-known/apple-app-site-association` and `assetlinks.json`. An OTA can't
do this.

## Release flow (dev → main)

The branch rule is `context.md` rule 3; this is how a change reaches users.

1. **Into `dev`:** a branch off `dev`, a PR into `dev`, merged once CI passes.
2. **Release PR:** a PR from `dev` into `main`, titled `Release: …` and
   listing the PRs it carries. CI and the "Release Source" check must pass.
3. **Ship from `main`:** after the merge, run CD (`cd.yml`, by hand) when
   the API, web apps or migrations changed, and publish the OTA from `main`
   with `release-ota.js` when the app changed. Nothing ships from `dev`.
4. **Hotfix:** for an urgent production fix only, a `hotfix/*` branch off
   `main` and a PR into `main`, shipped as in step 3; then a PR from `main`
   into `dev` brings it back the same day.

Until a dev environment (server and dev app) exists, step 2 follows step 1
right away whenever a change is to ship. Once it exists, merging into `dev`
deploys there and QA tests there before the release PR.

## Backend/web deploys

- CD reaches the server over SSH. Port 22 is to be closed to the internet
  (Tap Payments' account check, 2026-11-11, flagged it open): with the
  `TS_OAUTH_CLIENT_ID` / `TS_OAUTH_SECRET` secrets set, the job first joins
  the private Tailscale network (`tag:ci`) and `SSH_HOST` is the server's
  Tailscale address (100.x). Admins SSH the same way. Without those
  secrets the job connects as before. Never reopen 22 publicly; Hostinger's
  browser console is the way in if Tailscale is down.
- CD pipeline (`cd.yml`) is `workflow_dispatch`-only — it does not run
  automatically on push to `main`. After a `dev` → `main` PR merges,
  someone with write access must manually trigger it from the Actions
  tab. This is a deliberate human checkpoint before production changes go
  live.
- Production's database is the server's `postgres` container
  (docker-compose.yaml). Moving from Neon: `scripts/migrate-from-neon.sh
  '<neon direct url>' [--replace] [--switch]` on the server. It copies Neon
  first (read-only) and changes nothing on the server if that fails (it
  did on 2026-10-24: Neon over quota, while an earlier version had already
  moved the container to an empty volume and taken the API down). Then it
  asks before replacing a running container on another volume, loads into
  an empty database (`--replace` saves an existing one to
  `backups/box-<time>.sql` and empties it first), compares row counts, and
  with `--switch` points `DATABASE_URL`/`DIRECT_URL` at
  `postgres:5432` (backing up the old `apps/api/.env`). Postgres 17 runs
  on its own volume, `postgres17_data`; the old postgres:16 cluster in
  `postgres_data` (59 tables on the server, 2026-10-24) is kept untouched,
  and its data saved once to `backups/pg16-<time>.sql`. Quote the URL: its
  `&` otherwise ends the command. Rehearsed on 2026-10-24 against a
  stand-in Neon and an old Postgres 16 volume holding data.
- CD's `prisma migrate deploy` must connect directly, not through Neon's
  `-pooler` host: set `DIRECT_URL` (the same URL without `-pooler`) in the
  server's `apps/api/.env`; `prisma.config.ts` prefers it over
  `DATABASE_URL`. Through the transaction pooler, migrate's session-level
  advisory lock can stay held on a pooled connection, and every later
  deploy then fails with `P1002 ... pg_advisory_lock(72707369)` (CD #93,
  2026-10-21). To clear a leaked lock: find the holder with
  `SELECT pid FROM pg_locks WHERE locktype = 'advisory' AND objid = 72707369`
  and `pg_terminate_backend(<pid>)` it.
- `main` is never pushed to directly (pre-push hook and branch protection
  block it); changes land only via a release PR from `dev`, or a `hotfix/*`
  PR. See "Release flow" below.
