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
