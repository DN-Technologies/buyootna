describe('installNavigationDebounce', () => {
  let router: {
    push: jest.Mock;
    navigate: jest.Mock;
    replace: jest.Mock;
    back: jest.Mock;
    dismiss: jest.Mock;
    dismissAll: jest.Mock;
  };
  let originalPush: jest.Mock;
  let originalNavigate: jest.Mock;
  let originalReplace: jest.Mock;
  let originalBack: jest.Mock;
  let now: number;

  beforeEach(() => {
    // Fully isolated per test: installNavigationDebounce only wraps once
    // per module instance (module-scoped `installed` flag) and tracks the
    // last-navigation timestamp + last target in module state, so a fresh
    // module + fresh mocks per test avoids any cross-test bleed.
    jest.resetModules();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    router = require('expo-router').router;
    originalPush = router.push;
    originalNavigate = router.navigate;
    originalReplace = router.replace;
    originalBack = router.back;

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

  // Regression coverage for the reported bug: taps spread over more than
  // the 600ms burst window used to stack one duplicate screen per tap --
  // the same target must now be refused indefinitely until the user leaves
  // the screen.
  it('refuses a consecutive identical target even after the debounce window', () => {
    router.push('/chat/1' as any);
    now += 700;
    router.push('/chat/1' as any);
    now += 700;
    router.push('/chat/1' as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
  });

  it('allows the same target again once the user went back', () => {
    router.push('/chat/1' as any);
    now += 700;
    router.back();
    now += 700;
    router.push('/chat/1' as any);

    expect(originalPush).toHaveBeenCalledTimes(2);
    expect(originalBack).toHaveBeenCalledTimes(1);
  });

  it('normalizes object hrefs against their string equivalent', () => {
    router.push('/chat/1' as any);
    now += 700;
    router.push({
      pathname: '/chat/1',
      params: {},
    } as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
  });

  // QA: «إنشاء حساب» on المزيد opened the selection screen once; after
  // «تخطي والمتابعة كزائر» (a replace back to home) it never opened again
  it('allows the same target again once it was replaced (continue as guest)', () => {
    const { onNavigationStateChange } = require('../installNavigationDebounce');
    router.push('/(auth)/selection' as any);
    onNavigationStateChange('selection-1');
    now += 700;
    router.replace('/(individual)/home' as any);
    now += 700;
    router.push('/(auth)/selection' as any);

    expect(originalPush).toHaveBeenCalledTimes(2);
  });

  it('allows the same target again once another screen is focused (a swipe back)', () => {
    const { onNavigationStateChange } = require('../installNavigationDebounce');
    router.push('/(auth)/selection' as any);
    onNavigationStateChange('selection-1'); // the screen it opened
    onNavigationStateChange('more-1'); // swiped back: no router.back call
    now += 700;
    router.push('/(auth)/selection' as any);

    expect(originalPush).toHaveBeenCalledTimes(2);
  });

  it('keeps refusing it while the screen it opened is still showing', () => {
    const { onNavigationStateChange } = require('../installNavigationDebounce');
    router.push('/chat/1' as any);
    onNavigationStateChange('chat-1');
    onNavigationStateChange('chat-1'); // e.g. its params updated
    now += 700;
    router.push('/chat/1' as any);

    expect(originalPush).toHaveBeenCalledTimes(1);
  });

  it('still allows a different target after the window', () => {
    router.push('/chat/1' as any);
    now += 700;
    router.push('/chat/2' as any);

    expect(originalPush).toHaveBeenCalledTimes(2);
  });
});
