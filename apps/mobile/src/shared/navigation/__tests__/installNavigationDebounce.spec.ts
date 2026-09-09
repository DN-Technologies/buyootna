describe('installNavigationDebounce', () => {
  let router: { push: jest.Mock; navigate: jest.Mock; replace: jest.Mock };
  let originalPush: jest.Mock;
  let originalNavigate: jest.Mock;
  let originalReplace: jest.Mock;
  let now: number;

  beforeEach(() => {
    // Fully isolated per test: installNavigationDebounce only wraps once
    // per module instance (module-scoped `installed` flag) and tracks the
    // last-navigation timestamp in module state, so a fresh module +
    // fresh mocks per test avoids any cross-test bleed.
    jest.resetModules();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    router = require('expo-router').router;
    originalPush = router.push;
    originalNavigate = router.navigate;
    originalReplace = router.replace;

    const {
      installNavigationDebounce,
    } = require('../installNavigationDebounce');
    installNavigationDebounce();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lets the first call through for push, navigate, and replace', () => {
    router.push('/home' as any);
    now += 10_000;
    router.navigate('/search' as any);
    now += 10_000;
    router.replace('/profile' as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
    expect(originalNavigate).toHaveBeenCalledTimes(1);
    expect(originalReplace).toHaveBeenCalledTimes(1);
  });

  it('ignores rapid repeat taps within the debounce window', () => {
    router.push('/chat/1' as any);
    router.push('/chat/1' as any);
    router.push('/chat/1' as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
  });

  it('treats push/navigate/replace as one shared debounce window', () => {
    router.push('/a' as any);
    router.navigate('/b' as any);
    router.replace('/c' as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
    expect(originalNavigate).not.toHaveBeenCalled();
    expect(originalReplace).not.toHaveBeenCalled();
  });

  it('allows a new navigation once the debounce window has passed', () => {
    router.push('/a' as any);
    now += 700;
    router.push('/b' as any);

    expect(originalPush).toHaveBeenCalledTimes(2);
    expect(originalPush).toHaveBeenNthCalledWith(1, '/a');
    expect(originalPush).toHaveBeenNthCalledWith(2, '/b');
  });
});
