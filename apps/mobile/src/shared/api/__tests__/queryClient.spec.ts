// Verifies the fix for "app stays stuck offline until force-killed": React
// Query's default online detection reads the browser's navigator.onLine,
// which doesn't exist in React Native, so without explicitly wiring
// onlineManager to NetInfo the app never learns connectivity was restored.
//
// jest.resetModules() is used so each test gets a fresh @tanstack/react-query
// module instance (and thus a fresh onlineManager/focusManager singleton) --
// that instance must be `require`d fresh inside each test too, since a
// static top-level `import` would resolve before resetModules runs and end
// up pointing at a stale instance.

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { addEventListener: jest.fn() },
}));

describe('queryClient network/focus wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('registers a NetInfo listener that drives onlineManager.isOnline()', () => {
    const NetInfo = require('@react-native-community/netinfo').default;
    let netInfoListener: ((state: { isConnected: boolean | null }) => void) | undefined;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      netInfoListener = cb;
      return jest.fn();
    });

    require('../queryClient');
    const { onlineManager } = require('@tanstack/react-query');

    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
    expect(netInfoListener).toBeDefined();

    // Simulate losing connectivity, then regaining it -- this is the exact
    // repro from the bug report ("disconnect, then reconnect").
    netInfoListener!({ isConnected: false });
    expect(onlineManager.isOnline()).toBe(false);

    netInfoListener!({ isConnected: true });
    expect(onlineManager.isOnline()).toBe(true);
  });

  it('treats isConnected: null (unknown) as offline, not online', () => {
    const NetInfo = require('@react-native-community/netinfo').default;
    let netInfoListener: ((state: { isConnected: boolean | null }) => void) | undefined;
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      netInfoListener = cb;
      return jest.fn();
    });

    require('../queryClient');
    const { onlineManager } = require('@tanstack/react-query');

    netInfoListener!({ isConnected: null });
    expect(onlineManager.isOnline()).toBe(false);
  });

  it('registers an AppState listener that drives focusManager on foreground/background', () => {
    const { AppState } = require('react-native');
    const addListenerSpy = jest.spyOn(AppState, 'addEventListener');

    require('../queryClient');
    const { focusManager } = require('@tanstack/react-query');

    expect(addListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    const appStateListener = addListenerSpy.mock.calls[0][1] as (
      status: string,
    ) => void;

    appStateListener('background');
    expect(focusManager.isFocused()).toBe(false);

    appStateListener('active');
    expect(focusManager.isFocused()).toBe(true);
  });
});
