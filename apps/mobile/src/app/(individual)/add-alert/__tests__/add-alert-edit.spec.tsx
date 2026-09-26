import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { alertsService } from '@/shared/api/alerts.service';

import AddAlertScreen from '../index';

const mockBack = jest.fn();
const mockParams: { editId?: string } = {};

jest.mock('@gorhom/bottom-sheet');

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock('@/features/individual/hooks/useMyAlerts', () => ({
  useMyAlerts: jest.fn(),
}));

jest.mock('@/shared/api/alerts.service', () => ({
  ...jest.requireActual('@/shared/api/alerts.service'),
  alertsService: { create: jest.fn(), update: jest.fn() },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { activeIdentity: null }) => unknown) =>
    selector({ activeIdentity: null }),
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const savedAlert = {
  id: 'alert-1',
  type: 'PROPERTIES',
  operationType: 'RENT',
  governorateId: 'hawally',
  areaId: 'hawally_2',
  categoryId: 'apartment',
  price: null,
  rentValue: 500,
  areaSize: 150,
  rooms: null,
  baths: null,
  floors: null,
  requestYear: null,
  requiredYear: null,
  amenities: [],
  startDate: null,
  endDate: null,
  createdAt: '2026-09-01T00:00:00.000Z',
};

describe('AddAlertScreen edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete mockParams.editId;
    (useMyAlerts as jest.Mock).mockReturnValue({
      data: [savedAlert],
      isLoading: false,
    });
  });

  it('creates a new alert when opened without an id', async () => {
    const { getByText } = await render(<AddAlertScreen />);

    expect(getByText('إضافة تنبيه')).toBeTruthy();
    expect(getByText('إنشاء تنبيه')).toBeTruthy();
  });

  it('prefills the saved alert and saves it with update', async () => {
    mockParams.editId = 'alert-1';
    (alertsService.update as jest.Mock).mockResolvedValue(savedAlert);

    const { getByText } = await render(<AddAlertScreen />);

    expect(getByText('تعديل التنبيه')).toBeTruthy();
    await waitFor(() => expect(getByText('السالمية')).toBeTruthy());

    await fireEvent.press(getByText('حفظ التعديلات'));

    await waitFor(() =>
      expect(alertsService.update).toHaveBeenCalledWith(
        'alert-1',
        expect.objectContaining({
          operationType: 'RENT',
          governorateId: 'hawally',
          areaId: 'hawally_2',
          categoryId: 'apartment',
          rentValue: 500,
        }),
      ),
    );
    expect(alertsService.create).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('goes back when the alert to edit no longer exists', async () => {
    mockParams.editId = 'deleted-alert';

    await render(<AddAlertScreen />);

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(alertsService.update).not.toHaveBeenCalled();
  });
});
