import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { plansService } from '@/shared/api/plans.service';

import OfficeAddScreen from '../add';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: {
    getWallet: jest.fn(),
  },
}));

// The phone field starts on the office's contact number (no made-up default)
jest.mock('@/shared/api/contactPhone.service', () => ({
  contactPhoneService: {
    get: jest.fn().mockResolvedValue({
      useAccountPhone: true,
      accountPhone: '+96599990000',
      contactPhone: null,
      contactPhoneVerified: false,
      effectivePhone: '+96599990000',
    }),
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://test-image.jpg' }],
  }),
  MediaTypeOptions: { Images: 'Images' },
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: any) => children,
}));

// The quota selector is driven by the office persona's real wallet (QA:
// no hardcoded counters) — normal 5 + silver 4 = 9 remaining
function mockWallet(overrides?: Partial<{ normal: number; silver: number; freeAdsRemaining: number }>) {
  const { normal = 5, silver = 4, freeAdsRemaining = 0 } = overrides ?? {};
  (plansService.getWallet as jest.Mock).mockResolvedValue({
    freeAdsRemaining,
    slots: [
      {
        id: 'slot-normal-1',
        planId: 'plan-normal',
        planName: 'العادي',
        planSlug: 'normal',
        adsRemaining: normal,
        maxActiveAds: normal,
        createdAt: '2026-01-01',
      },
      {
        id: 'slot-silver-1',
        planId: 'plan-silver',
        planName: 'الفضي',
        planSlug: 'silver',
        adsRemaining: silver,
        maxActiveAds: silver,
        createdAt: '2026-01-01',
      },
    ],
  });
}

async function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return await render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('OfficeAddScreen (All 10 Figma States & Features)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    mockWallet();
  });

  it('renders top bar with title "إضافة إعلان" and action buttons', async () => {
    const { getByText, getByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('إضافة إعلان')).toBeTruthy();
    expect(getByTestId('top-back-button')).toBeTruthy();
    expect(getByTestId('top-map-button')).toBeTruthy();
  });

  it('handles back button press', async () => {
    const { getByTestId } = await renderWithClient(<OfficeAddScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('top-back-button'));
    });
    expect(router.back).toHaveBeenCalled();
  });

  it('renders all listing type options and allows toggling', async () => {
    const { getByText, getByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('نوع الإعلان')).toBeTruthy();
    expect(getByText('بيع')).toBeTruthy();
    expect(getByText('إيجار')).toBeTruthy();
    expect(getByText('بدل')).toBeTruthy();

    const rentButton = getByTestId('listing-type-rent');
    await act(async () => {
      fireEvent.press(rentButton);
    });

    const exchangeButton = getByTestId('listing-type-exchange');
    await act(async () => {
      fireEvent.press(exchangeButton);
    });
  });

  it('renders property info inputs and steppers', async () => {
    const { getByText, getByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('معلومات العقار')).toBeTruthy();
    expect(getByTestId('input-area')).toBeTruthy();
    expect(getByTestId('picker-governorate')).toBeTruthy();
    expect(getByTestId('button-map-location')).toBeTruthy();
    expect(getByTestId('input-space')).toBeTruthy();
    expect(getByTestId('picker-category')).toBeTruthy();
    expect(getByTestId('input-paci')).toBeTruthy();
    expect(getByTestId('input-age')).toBeTruthy();
    expect(getByTestId('stepper-rooms')).toBeTruthy();
    expect(getByTestId('stepper-bathrooms')).toBeTruthy();
  });

  it('increments and decrements room counters', async () => {
    const { getByTestId } = await renderWithClient(<OfficeAddScreen />);

    const roomsInc = getByTestId('stepper-rooms-increment');
    const roomsDec = getByTestId('stepper-rooms-decrement');
    const roomsValue = getByTestId('stepper-rooms-value');

    expect(roomsValue.props.children).toBe(1);
    await act(async () => {
      fireEvent.press(roomsInc);
    });
    expect(roomsValue.props.children).toBe(2);
    await act(async () => {
      fireEvent.press(roomsDec);
    });
    expect(roomsValue.props.children).toBe(1);
  });

  it('renders price details section with toggle and phone number', async () => {
    const { getByText, getByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('السعر والتفاصيل')).toBeTruthy();
    expect(getByText('تحديد السعر')).toBeTruthy();
    expect(getByTestId('toggle-price-active')).toBeTruthy();
    expect(getByTestId('input-phone')).toBeTruthy();
    expect(getByTestId('input-description')).toBeTruthy();
    expect(getByText('+965')).toBeTruthy();
  });

  it('quota selector reflects the real office wallet, not hardcoded numbers (QA: quota mismatch)', async () => {
    mockWallet({ normal: 5, silver: 4 });
    const { getByText } = await renderWithClient(<OfficeAddScreen />);

    // 5 normal + 4 silver = 9 remaining, from the wallet — not a literal
    await waitFor(() => {
      expect(getByText('5 عادي')).toBeTruthy();
      expect(getByText('4 فضي')).toBeTruthy();
      expect(getByText('9 إعلانات متبقية في باقتك')).toBeTruthy();
    });

    // A different balance changes what's shown
    mockWallet({ normal: 1, silver: 2 });
    const screen = await renderWithClient(<OfficeAddScreen />);
    await waitFor(() => {
      expect(screen.getByText('1 عادي')).toBeTruthy();
      expect(screen.getByText('2 فضي')).toBeTruthy();
      expect(screen.getByText('3 إعلانات متبقية في باقتك')).toBeTruthy();
    });
  });

  it('blocks publishing and warns when the office wallet has no ads left', async () => {
    mockWallet({ normal: 0, silver: 0 });
    const { getByTestId, getByText } = await renderWithClient(
      <OfficeAddScreen />,
    );

    await waitFor(() => {
      expect(
        getByText('لا توجد إعلانات متبقية في باقتك، يرجى شراء باقة إعلانية لنشر عقار جديد.'),
      ).toBeTruthy();
    });

    // Fill the required fields; publish stays disabled without credits
    await act(async () => {
      fireEvent.changeText(getByTestId('input-area'), 'السالمية');
    });
    expect(getByTestId('button-preview-ad').props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it('supports property income toggle and input for sell tab (Figma 4494:141833 & 4494:142107)', async () => {
    const { getByText, getByTestId, queryByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('مدخول العقار')).toBeTruthy();
    expect(getByTestId('toggle-income-active')).toBeTruthy();
    expect(queryByTestId('input-income')).toBeNull();

    // Toggle property income switch ON
    await act(async () => {
      fireEvent(getByTestId('toggle-income-active'), 'valueChange', true);
    });

    expect(getByTestId('input-income')).toBeTruthy();
    await act(async () => {
      fireEvent.changeText(getByTestId('input-income'), '1,200');
    });
    expect(getByTestId('input-income').props.value).toBe('1,200');
  });

  it('renders rent-specific fields, with the floors stepper only for categories that have floors', async () => {
    const { getByText, getByTestId, queryByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    // Switch to Rent
    await act(async () => {
      fireEvent.press(getByTestId('listing-type-rent'));
    });

    expect(getByText('الايجار الشهري')).toBeTruthy();
    // Floors follow the category, not the listing type
    expect(queryByTestId('stepper-floors')).toBeNull();
    await act(async () => {
      fireEvent.press(getByTestId('picker-category'));
    });
    await act(async () => {
      fireEvent.press(getByText('شقة'));
    });
    expect(getByTestId('stepper-floors')).toBeTruthy();
    expect(getByTestId('input-additional-expenses')).toBeTruthy();
    expect(getByTestId('input-rent-conditions')).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(
        getByTestId('input-additional-expenses'),
        'ماء وكهرباء',
      );
      fireEvent.changeText(
        getByTestId('input-rent-conditions'),
        'عائلات فقط',
      );
    });

    expect(getByTestId('input-additional-expenses').props.value).toBe(
      'ماء وكهرباء',
    );
    expect(getByTestId('input-rent-conditions').props.value).toBe(
      'عائلات فقط',
    );
  });

  it('renders exchange-specific fields and handles land vs house stepper visibility (Figma 4494:142486 & 4494:142573)', async () => {
    const { getByText, getByTestId, queryByTestId, queryByText } =
      await renderWithClient(
      <OfficeAddScreen />,
    );

    // Switch to Exchange
    await act(async () => {
      fireEvent.press(getByTestId('listing-type-exchange'));
    });

    expect(getByTestId('input-request-year')).toBeTruthy();
    expect(getByTestId('input-required-year')).toBeTruthy();
    expect(getByTestId('input-allocation-state')).toBeTruthy();

    // House shows steppers
    expect(getByTestId('stepper-rooms')).toBeTruthy();
    expect(getByTestId('stepper-bathrooms')).toBeTruthy();

    // Exchange offers only land and house; land has no steppers and no age
    await act(async () => {
      fireEvent.press(getByTestId('picker-category'));
    });
    expect(queryByText('شقة')).toBeNull();
    await act(async () => {
      fireEvent.press(getByText('أرض'));
    });

    expect(queryByTestId('stepper-rooms')).toBeNull();
    expect(queryByTestId('stepper-bathrooms')).toBeNull();
    expect(queryByTestId('stepper-floors')).toBeNull();
  });

  it('allows selecting frontage/orientation via OrientationDropdown (Figma 4494:141814 & 4494:142357)', async () => {
    const { getByTestId, getByText } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByTestId('orientation-trigger')).toBeTruthy();
    expect(getByText('ما يميز عقارك')).toBeTruthy();

    // Open dropdown
    await act(async () => {
      fireEvent.press(getByTestId('orientation-trigger'));
    });

    // Select "بطن وظهر"
    await act(async () => {
      fireEvent.press(getByTestId('orientation-option-0'));
    });

    expect(getByTestId('orientation-value').props.children).toBe('بطن وظهر');
  });

  it('supports choosing between normal and silver plan quotas (Figma 4494:141833)', async () => {
    const { getByTestId } = await renderWithClient(<OfficeAddScreen />);

    expect(getByTestId('office-plan-quota-selector')).toBeTruthy();
    expect(getByTestId('plan-quota-normal')).toBeTruthy();
    expect(getByTestId('plan-quota-silver')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('plan-quota-silver'));
    });
  });

  it('renders image dropzone and handles image pick', async () => {
    const { getByText, getByTestId } = await renderWithClient(
      <OfficeAddScreen />,
    );

    expect(getByText('الصور')).toBeTruthy();
    expect(getByText('اضغط هنا')).toBeTruthy();

    const uploadDropzone = getByTestId('upload-dropzone-button');
    await act(async () => {
      fireEvent.press(uploadDropzone);
    });
  });

  it('renders preview ad button and triggers alert on valid submit', async () => {
    const { getByTestId, getByText } = await renderWithClient(
      <OfficeAddScreen />,
    );

    // Fill required fields
    await act(async () => {
      fireEvent.changeText(getByTestId('input-area'), 'السالمية');
    });

    const previewButton = getByTestId('button-preview-ad');
    expect(previewButton).toBeTruthy();
    expect(getByText('معاينة الاعلان')).toBeTruthy();

    await act(async () => {
      fireEvent.press(previewButton);
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      'معاينة الإعلان',
      expect.stringContaining('تم حفظ بيانات الإعلان بنجاح'),
      expect.any(Array),
    );
  });
});
