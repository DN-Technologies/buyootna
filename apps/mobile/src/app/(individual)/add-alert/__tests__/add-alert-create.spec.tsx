import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { alertsService } from '@/shared/api/alerts.service';
import { showAlert } from '@/shared/utils/alert';

import AddAlertScreen from '../index';

jest.mock('@gorhom/bottom-sheet');

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), replace: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/features/individual/hooks/useMyAlerts', () => ({
  useMyAlerts: () => ({ data: [], isLoading: false }),
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

// A stand-in for the form: shows the chosen governorate and lets a test pick one
jest.mock('@/shared/components/add-alert/AlertPropertiesTab', () => {
  const { Text, TouchableOpacity, View } = require('react-native');
  return {
    ...jest.requireActual('@/shared/components/add-alert/AlertPropertiesTab'),
    __esModule: true,
    default: ({ value, onChange }: any) => (
      <View>
        <Text testID="governorate">{value.governorate || '(empty)'}</Text>
        <TouchableOpacity
          testID="pick-governorate"
          onPress={() => onChange('governorate', 'hawally')}
        />
      </View>
    ),
  };
});

describe('AddAlertScreen after creating an alert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (alertsService.create as jest.Mock).mockResolvedValue({ id: 'new' });
  });

  it('clears the form, so the same alert cannot be saved twice', async () => {
    const { getByTestId, getByText } = await render(<AddAlertScreen />);

    await fireEvent.press(getByTestId('pick-governorate'));
    expect(getByTestId('governorate').props.children).toBe('hawally');

    await fireEvent.press(getByText('إنشاء تنبيه'));
    await waitFor(() => expect(alertsService.create).toHaveBeenCalledTimes(1));

    // Success popup is up and the form is back to empty
    await waitFor(() => expect(getByText('تم تفعيل التنبيه')).toBeTruthy());
    expect(getByTestId('governorate').props.children).toBe('(empty)');

    // Saving again without refilling is refused
    await fireEvent.press(getByText('إنشاء تنبيه'));
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى اختيار المحافظة أولاً');
    expect(alertsService.create).toHaveBeenCalledTimes(1);
  });

  it('keeps the form when saving fails, so nothing is lost', async () => {
    (alertsService.create as jest.Mock).mockRejectedValue(new Error('boom'));
    const { getByTestId, getByText } = await render(<AddAlertScreen />);

    await fireEvent.press(getByTestId('pick-governorate'));
    await fireEvent.press(getByText('إنشاء تنبيه'));

    await waitFor(() => expect(showAlert).toHaveBeenCalled());
    expect(getByTestId('governorate').props.children).toBe('hawally');
  });
});
