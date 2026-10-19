/** The first argument of a mocked call, typed for assertions. */
export function callArg<T>(mock: jest.Mock, call = 0): T {
  return (mock.mock.calls as unknown[][])[call][0] as T;
}
