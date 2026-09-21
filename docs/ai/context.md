# AI Context — Buyootna Monorepo

Always read this file first, on every task, before touching any code. Do
**not** read the other files under `docs/ai/` by default — only the ones
relevant to the task at hand, per the routing table below.

## What this is

Buyootna is a real-estate platform: a NestJS + Prisma/PostgreSQL API, an
Expo/React Native mobile app, and several Next.js web portals, in a single
PNPM workspace.

| Directory | Package Name | Description |
| :--- | :--- | :--- |
| `apps/api` | `api` | NestJS REST & WebSocket Backend API (Prisma + PostgreSQL) |
| `apps/mobile` | `buyootna` | React Native & Expo Router Mobile Application |
| `apps/web/landing` | `@buyootna/web-landing` | Next.js Marketing & Landing Page |
| `apps/web/companies` | `@buyootna/web-companies` | Next.js Corporate / Company Portal |
| `apps/web/offices` | `@buyootna/web-offices` | Next.js Real Estate Agency / Office Portal |
| `apps/web/management` | `@buyootna/web-management` | Next.js Property Management Portal |
| `apps/web/admin` | `@buyootna/web-admin` | Next.js System Administrator Dashboard |
| `packages/ui` | `@buyootna/ui` | Shared UI components package |

## Where to read next

Read extra docs only when relevant — don't load all of them for every task:

- **Architecture / modules / data flow / new dependencies** → [`architecture.md`](./architecture.md)
- **Behavior changes / validation / new tests** → [`testing-policy.md`](./testing-policy.md)
- **Auth / permissions / PII / admin / third-party integrations / DB access** → [`security-policy.md`](./security-policy.md)
- **Release / OTA / native build / version bump / production-impacting change** → [`release-policy.md`](./release-policy.md)
- **Code review tasks** → [`code-review.md`](./code-review.md)
- **Unclear domain terms** → [`glossary.md`](./glossary.md)

## Rules that apply to every task, regardless of category

1. **Jest v29 everywhere.** Both `apps/api` and `apps/mobile` must stay on
   `jest@^29.7.0` / `@types/jest@^29.5.14` — `ts-jest` v29 and `jest-expo`
   require it. Do not upgrade Jest to v30.
2. **One lockfile.** Never let a `pnpm-lock.yaml` exist inside a
   sub-package (e.g. `apps/api/pnpm-lock.yaml`). Only the root lockfile is
   real.
3. **Branching.** `main` is production, `dev` is the integration branch.
   Feature work targets `dev`. `main` is never pushed to directly — it's
   blocked by a pre-push hook — and only takes changes via a `dev` → `main`
   PR gated by `.github/CODEOWNERS` review.
4. **Verify empirically, not just by typechecking.** A passing `tsc
   --noEmit` or a green test suite is necessary but not sufficient for
   anything integration-shaped (API contracts, OTA publishes, DB
   migrations). Prefer curl-testing a running server, inspecting an actual
   built artifact, etc. over trusting static checks alone. If you genuinely
   can't verify something live in your environment, say so plainly instead
   of claiming it works.

## If a task conflicts with a documented rule

If what's being asked would change something documented as a rule or
contract in one of the linked files above (an architectural pattern, a
security boundary, a release-safety check, a testing convention) — stop,
explain the conflict and its consequences to the user, and get explicit
approval before proceeding. Don't silently work around an established
contract.
