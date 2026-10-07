/* eslint-disable @typescript-eslint/no-require-imports */

// React Query's default 5-minute garbage-collection timer outlives a test
// file. With Jest running in band (CI runners have few cores) those timers
// kept the process alive ~5 minutes after the last test ("Jest did not exit
// one second after the test run has completed"). Every QueryClient a test
// builds gets gcTime: Infinity, which schedules no timer at all; a test that
// sets its own gcTime keeps it.
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  class TestQueryClient extends actual.QueryClient {
    constructor(config = {}) {
      const defaults = config.defaultOptions ?? {};
      super({
        ...config,
        defaultOptions: {
          ...defaults,
          queries: { gcTime: Infinity, ...defaults.queries },
          mutations: { gcTime: Infinity, ...defaults.mutations },
        },
      });
    }
  }
  return { ...actual, QueryClient: TestQueryClient };
});

// useSafeAreaInsets() throws without a <SafeAreaProvider> ancestor, and
// shared bottom sheets / bottom bars read the bottom inset to stay clear of
// the home indicator. Default it to zero insets for every test (files that
// need specific insets still jest.mock this module themselves).
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// The contact-phone block (edit profiles) and the new-ad phone prefill fetch
// /identities/current/contact-phone on mount. Unmocked, that real request
// could outlive a test file and fail CI with "import after the Jest
// environment has been torn down". Default to "uses the account's phone, no
// number"; files that need specific data jest.mock this module themselves.
jest.mock('@/shared/api/contactPhone.service', () => ({
  contactPhoneService: {
    get: jest.fn(() =>
      Promise.resolve({
        useAccountPhone: true,
        accountPhone: null,
        contactPhone: null,
        contactPhoneVerified: false,
        effectivePhone: null,
      }),
    ),
    requestOtp: jest.fn(() => Promise.resolve({ destination: '' })),
    verify: jest.fn(),
    setUseAccountPhone: jest.fn(),
  },
}));
