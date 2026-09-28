import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useAdActions } from '../useAdActions';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { patch: jest.fn(), delete: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

describe('useAdActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the dedicated Edit Ad screen, not the create flow', async () => {
    const { result } = await renderHook(() =>
      useAdActions({
        refetch: jest.fn(),
        triggerToast: jest.fn(),
        freeAdsRemaining: 1,
      }),
    );

    await act(() => result.current.handleEditAd('prop-1'));

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/edit-listing/prop-1');
  });
});
