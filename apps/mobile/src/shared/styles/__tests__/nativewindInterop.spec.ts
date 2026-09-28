const mockCssInterop = jest.fn();

jest.mock('nativewind', () => ({ cssInterop: mockCssInterop }));
jest.mock('expo-image', () => ({ Image: 'ExpoImage' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));

describe('nativewindInterop', () => {
  it('lets className style expo-image and expo-linear-gradient', () => {
    require('../nativewindInterop');

    expect(mockCssInterop).toHaveBeenCalledWith('ExpoImage', {
      className: 'style',
    });
    expect(mockCssInterop).toHaveBeenCalledWith('LinearGradient', {
      className: 'style',
    });
  });
});
