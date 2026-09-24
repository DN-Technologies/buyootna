let reloadAsync: jest.Mock;
let allowRTL: jest.Mock;
let forceRTL: jest.Mock;
let isRTL: boolean;
let rtl: typeof import('../rtl');

function loadFresh() {
  jest.resetModules();
  reloadAsync = jest.fn().mockResolvedValue(undefined);
  allowRTL = jest.fn();
  forceRTL = jest.fn();
  jest.doMock('expo-updates', () => ({ reloadAsync }));
  jest.doMock('react-native', () => ({
    I18nManager: {
      get isRTL() {
        return isRTL;
      },
      allowRTL,
      forceRTL,
    },
  }));
  rtl = require('../rtl');
}

describe('ensureRtlDirection', () => {
  beforeEach(() => {
    isRTL = false;
    loadFresh();
  });

  it('persists the RTL flags and reloads once on a fresh LTR boot', () => {
    rtl.ensureRtlDirection();

    expect(allowRTL).toHaveBeenCalledWith(true);
    expect(forceRTL).toHaveBeenCalledWith(true);
    expect(reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the app already boots RTL', () => {
    isRTL = true;
    loadFresh();

    rtl.ensureRtlDirection();

    expect(allowRTL).not.toHaveBeenCalled();
    expect(forceRTL).not.toHaveBeenCalled();
    expect(reloadAsync).not.toHaveBeenCalled();
  });

  it('never reloads twice within the same JS context', () => {
    rtl.ensureRtlDirection();
    rtl.ensureRtlDirection();

    expect(reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('boots clean after the reload (flags persisted, no second reload)', () => {
    rtl.ensureRtlDirection();

    // Simulates the post-reload JS context: fresh module state, and the
    // persisted flags now report isRTL = true from the native side.
    isRTL = true;
    loadFresh();
    rtl.ensureRtlDirection();

    expect(reloadAsync).not.toHaveBeenCalled();
  });
});
