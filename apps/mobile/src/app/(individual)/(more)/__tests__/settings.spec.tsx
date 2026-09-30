import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import SettingsScreen from '../settings';

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    replace: jest.fn(),
  }),
}));

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    deleteAccount: jest.fn(),
    requestSuspendOtp: jest.fn(),
    suspendAccount: jest.fn(),
  },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      token: 'mock-token',
      user: { phone: '+965 1234 5678' },
      logout: jest.fn(),
    })
  ),
}));

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

// Mock @gorhom/bottom-sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const { View, ScrollView, TextInput } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return <View testID="bottom-sheet-modal">{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => (
      <ScrollView>{children}</ScrollView>
    ),
    BottomSheetTextInput: (props: any) => <TextInput {...props} />,
  };
});

describe('SettingsScreen', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    (settingsService.getSettings as jest.Mock).mockResolvedValue({
      id: 'settings-1',
      userId: 'user-1',
      showPhone: true,
      showWhatsapp: true,
      hideActivity: false,
      hideOfficeAds: false,
    });
  });

  const renderWithProviders = async (ui: React.ReactElement) =>
    await render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );

  it('renders settings screen header and items', async () => {
    const { getByText, getByTestId } = await renderWithProviders(
      <SettingsScreen />
    );

    expect(getByText('الإعدادات')).toBeTruthy();
    expect(getByTestId('settings-back-button')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('اظهار رقم الواتساب')).toBeTruthy();
      expect(getByText('اخفاء النشاط')).toBeTruthy();
      expect(getByText('اخفاء اعلانات المكاتب')).toBeTruthy();
      expect(getByText('الدعم والمساعدة')).toBeTruthy();
      expect(getByText('سياسة الخصوصية')).toBeTruthy();
      expect(getByText('الشروط والأحكام')).toBeTruthy();
      expect(getByText('حذف الحساب')).toBeTruthy();
      expect(getByText('تعطيل الحساب مؤقتا')).toBeTruthy();
    });
  });

  it('lists every settings row and opens its screen', async () => {
    const { getByText } = await renderWithProviders(<SettingsScreen />);
    await waitFor(() => expect(getByText('تغيير كلمة المرور')).toBeTruthy());

    const rows: [string, string][] = [
      ['الإشعارات', '/notifications'],
      ['تغيير كلمة المرور', '/change-password'],
      ['الاجهزة المسجلة', '/devices'],
      ['عن بيوتنا', '/about'],
      ['الأسئلة الشائعة', '/faq'],
      ['تواصل معنا', '/contact'],
      ['سياسة الخصوصية', '/privacy'],
      ['الشروط والأحكام', '/terms'],
    ];
    for (const [title, route] of rows) {
      await fireEvent.press(getByText(title));
      expect(mockPush).toHaveBeenLastCalledWith(route);
    }
  });

  it('saves the show-phone switch', async () => {
    (settingsService.updateSettings as jest.Mock).mockResolvedValue({});
    const { getByTestId } = await renderWithProviders(<SettingsScreen />);
    await waitFor(() => expect(getByTestId('switch-phone')).toBeTruthy());

    await fireEvent(getByTestId('switch-phone'), 'valueChange', false);

    await waitFor(() =>
      expect(settingsService.updateSettings).toHaveBeenCalledWith({
        showPhone: false,
      }),
    );
  });

  it('toggles switch value and calls updateSettings', async () => {
    const { getByTestId } = await renderWithProviders(<SettingsScreen />);

    await waitFor(() => {
      expect(getByTestId('switch-activity')).toBeTruthy();
    });

    fireEvent(getByTestId('switch-activity'), 'valueChange', true);

    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      hideActivity: true,
    });
  });

  it('opens deactivation bottom sheet when clicking "تعطيل الحساب مؤقتا"', async () => {
    const { getByTestId } = await renderWithProviders(
      <SettingsScreen />
    );

    await waitFor(() => {
      expect(getByTestId('settings-deactivate-account')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('settings-deactivate-account'));

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
