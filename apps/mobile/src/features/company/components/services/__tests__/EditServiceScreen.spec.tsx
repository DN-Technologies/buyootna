import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { companyService } from '@/shared/api/company.service';

import EditServiceScreen from '../EditServiceScreen';
import { useServicesToast } from '../useServicesToast';

jest.mock('@/shared/api/company.service', () => ({
  companyService: {
    getMyServices: jest.fn(),
    updateServices: jest.fn(),
    deleteService: jest.fn(),
    createService: jest.fn(),
    setServiceHidden: jest.fn(),
    deleteAllServices: jest.fn(),
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

const data = {
  specialty: 'مكتب هندسي',
  servicesHidden: false,
  description: 'تنفيذ',
  createdAt: '2025-05-19T10:00:00.000Z',
  services: [
    { id: 's1', type: 'مخطط معماري (المساقط)', title: null, isHidden: false },
    { id: 's2', type: 'تصميم الواجهات', title: null, isHidden: false },
  ],
};

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EditServiceScreen />
    </QueryClientProvider>,
  );
}

describe('تعديل الخدمة', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useServicesToast.setState({ toast: null });
    api.getMyServices.mockResolvedValue(data);
    api.updateServices.mockResolvedValue(data);
    api.deleteService.mockResolvedValue({ success: true });
  });

  it('starts from the service with save disabled, and the creation date', async () => {
    const { findByDisplayValue, getByTestId, getByText } = await renderScreen();
    expect(await findByDisplayValue('تنفيذ')).toBeTruthy();
    expect(getByText('تاريخ الانشاء: 19 مايو 2025')).toBeTruthy();
    expect(getByTestId('company-submit').props.accessibilityState?.disabled).toBe(true);
  });

  it('saves only what changed: a hidden sub-service and the description', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent(await findByTestId('edit-service-switch-s2'), 'valueChange', false);
    await fireEvent.changeText(getByTestId('edit-service-description'), 'تنفيذ المشاريع');
    await fireEvent.press(getByTestId('company-submit'));
    await waitFor(() =>
      expect(api.updateServices).toHaveBeenCalledWith({
        description: 'تنفيذ المشاريع',
        rows: [{ id: 's2', isHidden: true }],
      }),
    );
    expect(router.back).toHaveBeenCalled();
    expect(useServicesToast.getState().toast).toBeNull();
  });

  it('hiding the whole service leaves «تم اخفاء الخدمة بنجاح.» on the list', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent(await findByTestId('edit-service-visibility'), 'valueChange', false);
    await fireEvent.press(getByTestId('company-submit'));
    await waitFor(() =>
      expect(api.updateServices).toHaveBeenCalledWith({ servicesHidden: true }),
    );
    expect(useServicesToast.getState().toast?.message).toBe('تم اخفاء الخدمة بنجاح.');
  });

  it('collapses the list into its summary', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('edit-service-toggle-list'));
    expect(getByTestId('edit-service-summary').props.children).toBe('2 خدمات نشطة');
  });

  it('deletes a sub-service after its confirmation', async () => {
    const { findByTestId, getAllByTestId } = await renderScreen();
    await fireEvent.press(await findByTestId('edit-service-delete-s1'));
    await fireEvent.press(getAllByTestId('confirm-sheet-confirm')[0]);
    await waitFor(() => expect(api.deleteService).toHaveBeenCalledWith('s1'));
  });
});
