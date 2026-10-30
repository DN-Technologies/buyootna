# Architecture

Read this when a task touches module structure, data flow, the Prisma
schema, navigation structure, state management, or adds a new dependency.

## Backend (`apps/api`)

- **Framework**: NestJS (v11), TypeScript strict mode.
- **Module layout**: every feature under `src/features/<name>/` follows
  `module.ts` / `controller.ts` / `service.ts` / `dto/`. Mirror this for
  new features rather than inventing a new layout.
- **ORM**: Prisma (v7) via `@prisma/adapter-pg` over `pg.Pool`, PostgreSQL
  — in production, the server's `postgres` container (docker-compose.yaml,
  Postgres 17, backed up daily into `backups/postgres`), moved from Neon
  with `scripts/migrate-from-neon.sh`; Neon stays for development. The schema is split across multiple `.prisma`
  files by feature (e.g. `identity.prisma`, `properties.prisma`,
  `alerts.prisma`) and loaded together via `--schema=prisma` (the whole
  `prisma/` directory, not a single file) — every Prisma CLI command in
  this repo passes that flag.
- **Testing**: Jest v29 + `ts-jest`. Every constructor-injected dependency
  in a `.spec.ts` needs a matching mock provider — see
  [`testing-policy.md`](./testing-policy.md).

### The Identity model

`Identity` (+ one of `IndividualIdentityData` / `CompanyIdentityData` /
`OfficeIdentityData`) is the current source of truth for login and
ownership — not the legacy `User`/profile models, which are being phased
out. When adding a new model that belongs to an account:

- Give it a single required `identityId` FK. Do **not** add a parallel
  `userId` field "for compatibility" — that dual-field pattern only exists
  on models that predate the Identity migration (`Favorite`, `Property`)
  and is not something to replicate going forward.
- Opaque location/category picker values (e.g. `governorateId`, `areaId`
  on `Property`/`Alert`) are plain strings matching a local, hardcoded
  list on the mobile side — not real foreign keys. This is deliberate,
  existing precedent; don't "fix" it into a real relation without checking
  with the user first, since it'd require reworking the mobile pickers too.

## Mobile (`apps/mobile`)

- **Framework**: Expo (v54) + Expo Router (v6) + React Native (v0.81),
  New Architecture enabled.
- **Routing**: file-based via Expo Router, with route groups per account
  type — `(individual)/`, `(company)/`, `(office)/`, plus `(auth)/` for
  the signup/login flows and top-level routes (`chat/`, `property/`, etc.)
  shared across account types.
- **State**: Zustand stores under `src/shared/store/`. Form validation via
  Zod schemas.
- **Data fetching**: `@tanstack/react-query`, configured in
  `src/shared/api/queryClient.ts` with a global `staleTime: 30_000`.
  **The established pattern in this codebase is explicit `refetch()`
  inside `useFocusEffect` when a screen needs fresh data on return — not
  `queryClient.invalidateQueries`, which has zero uses anywhere in this
  repo.** Follow the existing pattern (see `activity.tsx`, `chat/index.tsx`
  for examples) rather than introducing the alternative.
- **Feature flags**: `EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS` gates the whole
  `(company)` tab group and company signup behind `ComingSoonGate` —
  see [`glossary.md`](./glossary.md). It's `=true` only in local `.env`
  for day-to-day company-feature dev work, and must stay unset in every
  build profile that ships to real users. See
  [`release-policy.md`](./release-policy.md) for why this specific flag
  has already caused a production incident when a publish tool didn't
  account for it.
- **Server switches**: reels are hidden by `REELS_ENABLED` and
  `REELS_TESTER_USER_IDS` in the server's `apps/api/.env`, not by an
  `EXPO_PUBLIC_*` flag, so they turn on or off with an API restart and no OTA.
  The app asks `GET /reels/availability` and treats an error as off; every
  other `/reels` route answers 404 to anyone the switch is off for.
  `REELS_RANKED_FEED=true` sorts the feed by `Reel.rankScore` instead of
  newest first; scores refresh hourly either way, so it can be turned on once
  there is real watch data.

## Deeper reference

- `docs/plans/` — historical feature-design docs (already implemented;
  useful for "why does X work this way" archaeology, not a place to add
  new plans).
- `docs/flows/` — guest-mode UX flow documentation with screenshots.

Don't duplicate either of those into this file — link to them instead if a
task needs that level of detail.
