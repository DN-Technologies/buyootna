# Mobile OTA Release Workflow

This document explains how over-the-air (OTA) updates work for `apps/mobile`
(EAS project `buyootna-mobile`, ID `71d0c9e9-aa9f-4abc-a04e-c8b0733ad738`),
what can ship as an OTA update vs. what requires a new native build, and how
the Git pre-push analysis works.

For app-version/build-number bump rules, see [`apps/mobile/VERSIONING.md`](../apps/mobile/VERSIONING.md).
This document is about *how* a change gets shipped (OTA vs. native build);
VERSIONING.md is about *what version number* a native release gets.

## 1. How OTA works here

The app uses `expo-updates` with:

```ts
runtimeVersion: { policy: 'appVersion' }
updates: { url: 'https://u.expo.dev/71d0c9e9-aa9f-4abc-a04e-c8b0733ad738' }
```

`runtimeVersion` is derived automatically from the app's `version` field in
`app.config.ts`. A running app instance can only receive an OTA update whose
runtime version exactly matches the one it was built with — an update
published while the app version is `1.2.0` will never reach a binary that
was built when the app version was `1.1.10`.

Each `eas.json` build profile declares a `channel` (`development`,
`preview`, `production`). A binary built from the `production` profile
subscribes to the `production` channel and will pull whatever was most
recently published with `eas update --channel production` (subject to the
runtime-version match above).

## 2. Native binaries without `expo-updates` can't receive OTA — confirmed working otherwise

`expo-updates` support requires a native build that includes it. Any
binary built and submitted *before* `expo-updates` was added to this
project has no updates client at all and cannot receive OTA updates,
retroactively or otherwise — those users need a new native build/install
before OTA reaches them.

As of the production iOS build submitted and confirmed live in this
repo's history (build #9, version 1.3.0), the OTA pipeline is confirmed
working end-to-end against a real production build: `eas update --channel
production` publishes are verifiably served to that runtime via the
manifest endpoint, and confirmed reaching an installed build. Don't
assume OTA is broken by default — but do confirm, for any given cohort of
users, that they're on a native build that actually shipped with
`expo-updates` before assuming a publish will reach them.

## 3. What can be OTA

Compatible with the runtime already embedded in the native binary:

- JS/TS application logic, business logic, validation
- React components, screens, hooks, navigation logic
- Styling (NativeWind/Tailwind classes, style objects)
- API/service logic (`src/services`, `src/shared/api`, etc.)
- Copy/text changes
- Compatible asset changes (images, fonts *already bundled via an existing
  native module* — see limitation below on new font/icon packages)
- Bug fixes that don't touch native config or native dependencies

## 4. What requires a new native build

- Anything under `ios/` or `android/` (normally gitignored/generated, but
  if a native file is ever committed, treat it as native)
- `apps/mobile/app.config.ts` / `app.json` — permissions, bundle IDs, config
  plugins, native capabilities
- `apps/mobile/plugins/**` — Expo config plugins
- `Podfile`, `Podfile.lock`, `*.pbxproj`, `Info.plist`, `AndroidManifest.xml`
- Any dependency that ships native code or a config plugin (most
  `expo-*`, `react-native-*`, `@react-native*`, `@rnmapbox/*`,
  `@sentry/react-native`, `@gorhom/*`, `@shopify/flash-list`, etc.)
- Adding/removing/upgrading `expo` or `react-native` themselves
- A bump to the app `version` in `app.config.ts` (changes the runtime
  version — a new binary is required for that runtime to exist at all)

## 5. Ambiguous — needs a human decision

Some changes can't be classified automatically:

- `eas.json` (build-time env vars baked into the JS bundle at either build
  or publish time — depends on what changed)
- `babel.config.js`, `metro.config.js` (bundling config — could affect
  what native code gets compiled in, e.g. the Reanimated plugin)
- Any dependency the classifier doesn't recognize

These are never auto-published. Treat them as native-required unless you
can personally verify otherwise.

## 6. Runtime version & channels

| Build profile (`eas.json`) | Channel       |
| --------------------------- | ------------- |
| `development`                | `development` |
| `preview`                    | `preview`     |
| `production`                 | `production`  |

`runtimeVersion.policy: "appVersion"` means the runtime version equals
whatever `version` is in `app.config.ts` at build time. OTA updates
published to a channel are only offered to installed binaries whose
embedded runtime version matches.

## 7. Publishing an OTA update manually

Never run `eas update` directly from memory — use the checked-in script,
which runs a pre-publish checklist (clean working tree, current
commit/branch, runtime version target, EAS project/account, channel) and
requires typing `PUBLISH` to confirm:

```bash
pnpm --filter buyootna release:ota -- --channel production --message "Fix login validation"
```

`--channel` defaults to `production`. `--message` is required and becomes
the update's description in the EAS dashboard.

Since a version bump isn't safe for a routine OTA push (see §11), the app
`version` never changes across these publishes, so it can't tell QA "this
build has the fix." Instead, `release-ota.js` bakes `--message` and the
publishing commit's short SHA into the published bundle itself (via
`EXPO_PUBLIC_OTA_RELEASE_NOTE` / `EXPO_PUBLIC_OTA_COMMIT`), and the About
screen (Settings → About) displays them alongside whether the running
bundle is embedded or an OTA update and its EAS update ID — so anyone
(QA included) can open About and read exactly what shipped, without EAS
dashboard or git access.

## 8. How the Git pre-push release analysis works

`.husky/pre-push` runs `apps/mobile/scripts/release-analysis.js` once per
pushed ref, **before** the push completes.

- It only activates when the pushed range touches files under
  `apps/mobile/`. Pushes that don't touch the mobile app are unaffected.
- It classifies every changed file (and every changed `package.json`
  dependency) as `OTA_SAFE`, `NATIVE_REQUIRED`, or `AMBIGUOUS` using the
  deterministic rules in `apps/mobile/scripts/release-rules.js` — see
  sections 3–5 above for the actual rules.
- If multiple commits are being pushed together, the **worst**
  classification across the whole combined diff wins (one native-required
  file anywhere in the range makes the whole push `NATIVE_REQUIRED`).
- For `OTA_SAFE` pushes, it asks interactively (reading from `/dev/tty`,
  so it works even though `stdin` is occupied by Git's ref data):
  ```
  [1] Yes  - Publish OTA
  [2] No   - Don't publish now
  [3] No   - This belongs to a new app version
  ```
  Answering "Yes" does **not** publish anything — it prints the
  `release:ota` command to run yourself afterward. Detection (this hook)
  and deployment (`release:ota`) are intentionally separate steps.
- For `NATIVE_REQUIRED` / `AMBIGUOUS`, it just prints the reasoning — no
  prompt, no action needed.
- The hook **never blocks a normal push** because of this analysis: if
  `node` isn't on `PATH`, the script is missing, or anything throws, it
  fails open (warns and exits 0). The only thing this pre-push hook still
  hard-blocks is a direct push to `main` (pre-existing rule, unrelated to
  OTA).
- Test it manually without pushing:
  ```bash
  pnpm --filter buyootna release:analyze                 # HEAD vs its upstream
  pnpm --filter buyootna release:analyze -- <sha1>..<sha2>
  ```

## 9. How to create a new App Store version

1. Follow `apps/mobile/VERSIONING.md` to compute the next `version` and
   confirm whether iOS `buildNumber` / Android `versionCode` need
   incrementing (they're managed remotely — `eas.json` uses
   `"appVersionSource": "remote"` with `"autoIncrement": true` on the
   `production` profile, so EAS increments the build number for you on
   each production build).
2. Update `version` in `apps/mobile/app.config.ts` (this also moves the
   runtime version, since the policy is `appVersion`).
3. Build: `eas build --profile production --platform all` (or a single
   platform).
4. Submit manually when ready — this workflow does not auto-submit:
   `eas submit --profile production --platform ios` /
   `--platform android`.

None of this is automated by the pre-push hook or by `release-ota.js`.
Both are advisory/manual by design.

## 10. Rollback / recovering from a bad OTA update

```bash
# List recent updates on a branch/channel
eas update:list --branch production

# Inspect a specific update
eas update:view <update-id>

# Roll back by republishing an earlier, known-good update group to the channel
eas update:republish --group <update-group-id> --channel production
```

If you need to stop OTA entirely for affected users while you investigate,
you can also ship a native build with `Updates.checkAutomatically` set to
never/only-on-launch-with-manual-check as a longer-term mitigation, or
instruct users to reinstall from the store (which always gets the embedded
JS, not the broken update). There is no destructive/automatic rollback
wired into this repo — recovery is always a deliberate, manual command.

## 11. Important limitations

- **OTA cannot reach any user until a new native build (containing this
  `expo-updates` setup) is built and submitted/installed.** See §2.
- Native code, permissions, config plugins, and dependencies with native
  modules can never ship via OTA — see §4.
- A change to the app `version` always requires a new native build for
  that runtime version to exist, even if nothing else about the change
  is native.
- The pre-push classifier is a deterministic, file-pattern-based heuristic.
  It errs conservative (unknown → `AMBIGUOUS` or `NATIVE_REQUIRED`), but it
  is not a substitute for judgment — review the analysis, don't rubber-stamp it.
- Nothing in this workflow ever auto-publishes an OTA update or
  auto-builds/submits a native binary. Every publish requires a human
  typing `PUBLISH` in `release-ota.js`; every native build/submit is a
  manual `eas build` / `eas submit` command you run yourself.
