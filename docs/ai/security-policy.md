# Security Policy

Read this for anything touching auth, permissions, PII, the admin module,
third-party integrations (Twilio, Sentry, S3, Mapbox), or direct database
access.

## Authentication

- Passport JWT strategy (`AuthGuard('jwt')`) for authenticated routes,
  Local strategy for login, Twilio SMS OTP for phone verification.
- **OTP rate limiting**: `OtpRateLimiterService` is checked via
  `OtpRateLimitGuard` on the request path. **Recording a successful send
  (`recordRequest`) is the responsibility of the specific caller that
  knows the correct guard-matching key — never `TwilioService.
  sendVerification()` itself.** This repo shipped a bug where
  `sendVerification` recorded its own request, causing every caller to
  double/triple-count and escalate the cooldown incorrectly; it was fixed
  by moving `recordRequest` into each caller. Don't reintroduce recording
  inside the shared send method.

## API documentation exposure

- Swagger UI (`/docs`, `/api/docs`) is protected by HTTP Basic Auth in
  `createSwaggerAuthMiddleware` (`apps/api/src/core/swagger/
  swagger-auth.middleware.ts`), controlled by `SWAGGER_USER`/
  `SWAGGER_PASSWORD` env vars (with hardcoded defaults if unset). Treat
  these as real credentials — don't disable the guard or weaken it without
  checking with the user first.

## Admin module

`apps/api/src/features/admin/` is RBAC-relevant — anything touching it
(new endpoints, permission checks, the web admin portal at
`apps/web/admin`) is a security-sensitive change, not a routine feature
change. Flag it explicitly and be conservative about scope.

### Moderation (App Store Guideline 1.2)

Reports and blocks are a 24-hour commitment to Apple: every new report
(account, story, listing, review) and every new block emails
`MODERATION_ALERT_EMAIL` (set in the server's `apps/api/.env`;
comma-separated for several people). Someone must watch that inbox every
day. Acting on a report is admin › البلاغات › «حذف المحتوى وإيقاف الحساب»
(`POST /admin/reports/:id/enforce`): it removes the listing, review or
story, suspends the account that posted it and resolves the report. Keep
`apps/api/src/core/content-filter/banned-words.ts` to unambiguous words:
a false positive refuses a real listing.

## Database access

- CLAUDE.md's standing rule: **development/local always uses the Neon
  `DATABASE_URL` already configured in `apps/api/.env` — never point
  local dev at the production database.** This file doesn't restate that
  rule, it reinforces it: treat it as load-bearing, not a suggestion.
- Before running any migration that will touch a real (dev or prod)
  database, confirm which instance `DATABASE_URL` actually resolves to —
  don't assume from the variable name alone. This repo's production
  `.env` has at times pointed at a Neon instance shared with development,
  which is exactly the kind of thing that looks fine until a migration
  runs somewhere unintended. When in doubt, do a read-only check
  (`SELECT current_database()`, check row counts/timestamps against what
  you expect) before writing.
- If you ever discover migration history that doesn't match the live
  database state (a stuck `_prisma_migrations` record, a table that
  exists without a corresponding migration file), do not run `prisma
  migrate reset` to "fix" it — that drops all data. Repair the history
  with `prisma migrate resolve --applied` after confirming the live
  schema is actually correct, the way this was done earlier in this
  repo's history for a drifted `Session`/`CompanyProject` migration state.

## Testing portal (testing.buyootna.cloud / .com)

`apps/web/testing` + `apps/api/src/features/testing-portal/`. It runs on the
production server against production data, behind its own password
(`TestingCredential` LOGIN, `testing:set-password`) and token secret
(`TESTING_JWT_SECRET`) — never the app's or the docs portal's.

Two capabilities exist **by the owner's explicit decision (2026-10-26)**,
after the risk was explained, and break the rules above on purpose:

1. **Every user's OTP is shown** (not only test accounts). Anyone with the
   portal password can sign in as any real user. Safeguards that must stay:
   codes are hidden until tapped and every reveal is written to
   `TestingAuditLog` (who, which recipient, when); codes live only in memory
   and are dropped when used or expired — never written to the database,
   logs or a cache (the PWA's service worker caches no API data). Phone
   OTPs go through Twilio Verify with a code the server makes (`customCode`,
   2026-10-29, at the owner's request so QA sees every code); Verify
   delivers it, the server checks it (in memory, like the feed) and reports
   it approved to Twilio, as Twilio requires for custom codes. If the Twilio account has custom codes disabled,
   Verify makes the code and that one can't be shown.
2. **Wiping the production database** from the portal: typed confirmation
   («buyootna-production»), the separate DANGER password, a 10-second
   countdown, and a `pg_dump` to S3 first — no backup, no wipe. The backup
   must be private: the bucket policy makes every prefix public except the
   ones in its `NotResource` list (`chat/`, `stories/`, `backups/`), so the
   wipe checks the uploaded backup can't be read anonymously, and if it
   can, deletes it and stops. A wrong DANGER password is a 403 (5 per IP
   per 15 minutes) and is audited. Seeding only runs on a database with no
   users, and never creates the admin account.

Don't widen either (e.g. persist codes, skip the backup) without the owner.
If the portal password may have leaked, rotate it at once
(`docker compose run --rm api node dist/src/scripts/testing-set-password.js LOGIN`
signs everyone out) and review `TestingAuditLog`.
