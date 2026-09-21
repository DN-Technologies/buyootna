# Glossary

Domain terms in this codebase likely to confuse a fresh session.

- **Identity vs. User** — `Identity` (+ `IndividualIdentityData` /
  `CompanyIdentityData` / `OfficeIdentityData`) is the current source of
  truth for login/ownership. `User` and older per-type profile models are
  legacy and being phased out. See [`architecture.md`](./architecture.md).
- **Runtime version vs. app version vs. build number vs. Git tag** — four
  different numbers that are easy to conflate:
  - *App version* (`app.config.ts`'s `version` field) — the
    human-facing semver, e.g. `1.3.0`.
  - *Runtime version* — derived automatically from the app version
    (`runtimeVersion: { policy: 'appVersion' }`). Determines which OTA
    updates a given native binary can receive.
  - *Build number* (iOS `buildNumber` / Android `versionCode`) — an
    internal counter, managed remotely by EAS (`appVersionSource:
    "remote"`), incremented on every production build regardless of
    whether the app version changed.
  - *Git tag* (`v1.5.0`) — an optional, separate marker on a commit; see
    `apps/mobile/VERSIONING.md` §13.
  - Note: `package.json`'s `version` field is *not* any of these — see
    [`release-policy.md`](./release-policy.md) for the current drift
    between it and `app.config.ts`'s version.
- **OTA channel vs. Git branch** — unrelated namespaces that happen to
  share some names. A channel (`development`/`preview`/`production`) is
  an EAS Update concept tied to an `eas.json` build profile; a Git branch
  is source control. Don't assume "production channel" means "the `main`
  branch" or vice versa.
- **`ComingSoonGate`** — a shared component that renders a placeholder
  screen instead of a route group's real content, used to gate the whole
  `(company)` tab group behind the `EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS`
  flag until that feature is ready for production.
- **Opaque "local id" fields** (`governorateId`, `areaId`, `categoryId`
  on `Property`/`Alert`) — plain strings matching a hardcoded list on the
  mobile side, not real foreign keys to a `Governorate`/`Area` table.
  Existing, deliberate precedent — see
  [`architecture.md`](./architecture.md).
