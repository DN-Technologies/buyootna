import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import apiClient from '@/shared/api/api';
import { useAlertStore } from '@/shared/store/useAlertStore';
import { useAuthStore } from '@/shared/store/useAuthStore';

import AddIdentityIndividualScreen from '../add-identity-individual';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockRefreshProfile = jest.fn();

describe('AddIdentityIndividualScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefreshProfile.mockResolvedValue(undefined);
    mockUseAuthStore.mockImplementation(
      (selector?: (s: { refreshProfile: jest.Mock }) => unknown) => {
        const state = { refreshProfile: mockRefreshProfile };
        return selector ? selector(state) : state;
      },
    );
    jest.spyOn(useAlertStore.getState(), 'showAlert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const fillAndSubmit = async (
    getByPlaceholderText: any,
    getByText: any,
    overrides: { name?: string; whatsapp?: string } = {},
  ) => {
    await fireEvent.changeText(
      getByPlaceholderText('مثال: محمد أحمد'),
      overrides.name ?? 'محمد أحمد',
    );
    if (overrides.whatsapp !== undefined) {
      await fireEvent.changeText(
        getByPlaceholderText('96512345678'),
        overrides.whatsapp,
      );
    }
    await fireEvent.press(getByText('تأكيد وإضافة الهوية'));
  };

  it('blocks submit when the name is shorter than 2 characters', async () => {
    const { getByPlaceholderText, getByText } = await render(
      <AddIdentityIndividualScreen />,
    );

    await fillAndSubmit(getByPlaceholderText, getByText, { name: 'م' });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it('creates the identity, refreshes the profile, and navigates on success', async () => {
    mockApiClient.post.mockResolvedValue({ data: { id: 'identity-1' } });
    const { getByPlaceholderText, getByText } = await render(
      <AddIdentityIndividualScreen />,
    );

    await fillAndSubmit(getByPlaceholderText, getByText, {
      name: 'محمد أحمد',
      whatsapp: '96512345678',
    });

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/identities/individual', {
        name: 'محمد أحمد',
        whatsapp: '96512345678',
      });
    });
    expect(mockRefreshProfile).toHaveBeenCalled();

    const alertCall = (
      useAlertStore.getState().showAlert as jest.Mock
    ).mock.calls.find((call) => call[0] === 'تم بنجاح');
    expect(alertCall).toBeDefined();
    const okButton = alertCall![2].find((b: any) => b.text === 'حسناً');
    await act(async () => okButton.onPress());
    expect(router.replace).toHaveBeenCalledWith('/(individual)/more');
  });

  it('shows an alert with the backend message and does not navigate on failure', async () => {
    mockApiClient.post.mockRejectedValue({
      response: { data: { message: 'حدث خطأ ما' } },
    });
    const { getByPlaceholderText, getByText } = await render(
      <AddIdentityIndividualScreen />,
    );

    await fillAndSubmit(getByPlaceholderText, getByText, { name: 'محمد أحمد' });

    await waitFor(() => {
      expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith('خطأ', 'حدث خطأ ما');
    });
    expect(mockRefreshProfile).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
