# Testing Policy

Read this when a task changes behavior, adds validation, or needs test
coverage.

## Version pin

Both `apps/api` and `apps/mobile` must stay on `jest@^29.7.0` and
`@types/jest@^29.5.14`. `ts-jest` v29 and `jest-expo` both require Jest
v29 — do not upgrade to Jest v30.

## Backend (`apps/api`)

- Jest v29 + `ts-jest`.
- Every constructor-injected dependency in a service/controller under test
  needs an explicit mock provider in `Test.createTestingModule`:
  `{ provide: SomeService, useValue: { methodUsed: jest.fn() } }`. See
  `companies.service.spec.ts` or `alerts.service.spec.ts` for the
  established shape (mock `PrismaService` methods directly, assert on
  what they were called with).
- DTO validation tests use `class-validator`'s `validate()` directly
  against a `plainToInstance`-built instance — see
  `create-property.dto.spec.ts` / `create-alert.dto.spec.ts` for the
  pattern, including how `@ValidateIf`-gated conditional fields are
  tested (assert the field's errors are present/absent depending on a
  sibling field's value, not just "does validation pass").

## Mobile (`apps/mobile`)

- Jest v29 + `jest-expo`.
- Recurring setup gotchas already hit in this repo — reuse these patterns
  rather than rediscovering them:
  - A component calling `useSafeAreaInsets()` or `useFocusEffect()` throws
    in a bare test render without a real provider ancestor. Mock it:
    ```ts
    jest.mock('react-native-safe-area-context', () => ({
      ...jest.requireActual('react-native-safe-area-context'),
      useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
    }));
    jest.mock('@react-navigation/native', () => ({
      useFocusEffect: (effect: () => void) => effect(),
    }));
    ```
    (see `activity.spec.tsx`, `more.spec.tsx`,
    `chat-conversation-isolation.spec.tsx` for real examples).
  - This React Native Testing Library version's `render()` returns a
    Promise — `await render(...)`, not a bare call.
  - `--forceExit` (or accepting the benign "worker failed to exit
    gracefully" warning) is expected when a spec mounts a real
    `QueryClientProvider` — React Query's internal GC timer keeps Node's
    event loop alive. This is not a real leak to chase down.
  - Pure-function helpers (payload mappers, formatters) get their own
    focused spec file even when the component that uses them also has
    coverage — see `alerts.service.spec.ts`'s mapper tests.
  - Not every hook needs a dedicated test. If there's no existing
    precedent in this repo for testing a bare `useQuery`/`useInfiniteQuery`
    wrapper hook, don't invent an isolated one-off pattern for a new one —
    match what's already established or skip it.

## The bigger rule: verify empirically

A green test suite and a clean `tsc --noEmit` are necessary but not
sufficient for anything integration-shaped — a new API endpoint, an OTA
publish, a DB migration, a UI layout fix. Prefer:

- curl-testing a running local server over trusting a mocked unit test
  alone for a new endpoint's actual behavior,
- inspecting the real built artifact (e.g. `strings` on an exported JS
  bundle to confirm an env var actually baked in correctly) over trusting
  that a config change "should" have worked,
- reproducing a UI bug live (simulator/device) before claiming a fix
  worked, when that's possible in your environment.

If you genuinely cannot verify something live (no device/simulator
interaction available, no way to trigger a real network condition), say
so plainly in your summary instead of claiming success. Several fixes in
this repo's history were explicitly marked "not verified on-device,
please confirm" rather than asserted as done — that's the right instinct
when live verification isn't possible, not a failure to avoid admitting.
