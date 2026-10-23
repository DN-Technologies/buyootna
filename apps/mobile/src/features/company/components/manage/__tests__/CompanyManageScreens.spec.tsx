import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { companyService } from '@/shared/api/company.service';
import { showAlert } from '@/shared/utils/alert';

import MyServicesScreen from '../MyServicesScreen';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getMyServices: jest.fn(),
    deleteService: jest.fn(),
  },
}));

const mockRefreshProfile = jest.fn();
jest.mock('@/shared/store/useAuthStore', () => {
  const state = { token: 'token', refreshProfile: () => mockRefreshProfile() };
  const useAuthStore = (selector?: (s: typeof state) => unknown) =>
    selector ? selector(state) : state;
  return { useAuthStore };
});

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const api = companyService as jest.Mocked<typeof companyService>;

function renderScreen(screen: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{screen}</QueryClientProvider>,
  );
}

describe('More › الخدمات', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getMyServices.mockResolvedValue({
      specialty: 'تشطيبات',
      services: [
        { id: 's1', type: 'دهانات', title: null, description: 'داخلي وخارجي' },
        { id: 's2', type: 'اخرى', title: 'عزل أسطح', description: null },
      ],
    });
    api.deleteService.mockResolvedValue({ success: true });
  });

  it('lists the services, not the add form', async () => {
    const { findByText, getByText, queryByText } = await renderScreen(
      <MyServicesScreen />,
    );
    expect(await findByText('دهانات')).toBeTruthy();
    // "اخرى" shows the title the company gave it
    expect(getByText('عزل أسطح')).toBeTruthy();
    expect(getByText('داخلي وخارجي')).toBeTruthy();
    expect(getByText('التخصص: تشطيبات')).toBeTruthy();
    expect(queryByText('إضافة الخدمة')).toBeNull();
  });

  it('the add button opens the add-service form', async () => {
    const { findByText, getByText } = await renderScreen(<MyServicesScreen />);
    await findByText('دهانات');
    await fireEvent.press(getByText('إضافة خدمة'));
    expect(router.push).toHaveBeenCalledWith('/add-service');
  });

  it('deletes a service after the confirmation and reloads the list', async () => {
    const { findByText, getByTestId } = await renderScreen(
      <MyServicesScreen />,
    );
    await findByText('دهانات');
    api.getMyServices.mockResolvedValue({
      specialty: 'تشطيبات',
      services: [
        { id: 's2', type: 'اخرى', title: 'عزل أسطح', description: null },
      ],
    });

    await fireEvent.press(getByTestId('manage-delete-s1'));
    expect(api.deleteService).not.toHaveBeenCalled();
    await fireEvent.press(getByTestId('confirm-sheet-confirm'));

    await waitFor(() => expect(api.deleteService).toHaveBeenCalledWith('s1'));
    await waitFor(() => expect(api.getMyServices).toHaveBeenCalledTimes(2));
    expect(mockRefreshProfile).toHaveBeenCalled();
  });

  it('cancelling the confirmation deletes nothing', async () => {
    const { findByText, getByTestId } = await renderScreen(
      <MyServicesScreen />,
    );
    await findByText('دهانات');
    await fireEvent.press(getByTestId('manage-delete-s1'));
    await fireEvent.press(getByTestId('confirm-sheet-cancel'));
    await fireEvent.press(getByTestId('confirm-sheet-confirm'));
    expect(api.deleteService).not.toHaveBeenCalled();
  });

  it('a failed delete says so', async () => {
    api.deleteService.mockRejectedValue(new Error('network'));
    const { findByText, getByTestId } = await renderScreen(
      <MyServicesScreen />,
    );
    await findByText('دهانات');
    await fireEvent.press(getByTestId('manage-delete-s1'));
    await fireEvent.press(getByTestId('confirm-sheet-confirm'));
    await waitFor(() =>
      expect(showAlert).toHaveBeenCalledWith(
        'فشل حذف الخدمة',
        expect.any(String),
        expect.any(Array),
      ),
    );
  });

  it('with no services: the empty state and the add button', async () => {
    api.getMyServices.mockResolvedValue({ specialty: null, services: [] });
    const { findByTestId, getByText } = await renderScreen(
      <MyServicesScreen />,
    );
    expect(await findByTestId('manage-list-empty')).toBeTruthy();
    expect(getByText('لا توجد خدمات بعد')).toBeTruthy();
    expect(getByText('إضافة خدمة')).toBeTruthy();
  });
});
