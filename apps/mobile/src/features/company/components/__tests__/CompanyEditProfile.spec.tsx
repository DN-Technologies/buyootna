import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import apiClient from '@/shared/api/api';
import { settingsService } from '@/shared/api/settings.service';
import { useAlertStore } from '@/shared/store/useAlertStore';
import { useAuthStore } from '@/shared/store/useAuthStore';

import CompanyEditProfile from '../CompanyEditProfile';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    updateProfile: jest.fn(),
    getLoginMethod: jest.fn(),
    requestPhoneOtp: jest.fn(),
    verifyPhone: jest.fn(),
    requestEmailOtp: jest.fn(),
    verifyEmail: jest.fn(),
  },
}));

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: {
    patch: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
  validateApiUrl: jest.fn(() => 'http://localhost:8000'),
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

const mockPresent = jest.fn();
jest.mock('@gorhom/bottom-sheet', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    __esModule: true,
    BottomSheetModal: React.forwardRef(function MockSheet(
      props: any,
      ref: any,
    ) {
      React.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: jest.fn(),
      }));
      return <View>{props.children}</View>;
    }),
    BottomSheetBackdrop: () => null,
    BottomSheetView: ({
      children,
      testID,
    }: {
      children: React.ReactNode;
      testID?: string;
    }) => <View testID={testID}>{children}</View>,
  };
});

// The map, reduced to its confirm: picking returns this place
let mockMapProps: {
  visible: boolean;
  onConfirm: (name: string, lat: number, lng: number) => void;
};
jest.mock('@/shared/components/map/MapPickerModal', () => ({
  __esModule: true,
  default: (props: typeof mockMapProps) => {
    mockMapProps = props;
    return null;
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// useTabBarHeight() calls useSafeAreaInsets(), which throws without a real
// <SafeAreaProvider> ancestor -- stub it rather than wrap every render.
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

const mockCompanyIdentity = {
  id: 'identity-123',
  type: 'COMPANY',
  companyData: {
    name: 'دار العقار الحديث',
    hqLocation: 'السالمية',
    serviceAreas: 'العاصمة',
    about: 'نبذة تجريبية',
    services: 'من 9 صباحا حتى 5 مساءا',
    licenseActivity: 'تشطيبات',
    licenseNumber: '6743963845',
    licenseExpiry: '15 ابريل 2027',
    logoUrl: 'https://example.com/logo.jpg',
    licenseFileUrl: null,
  },
};

describe('CompanyEditProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
      loginMethod: 'BOTH',
      email: 'salemelshekh@gmail.com',
      phone: '+96558094586',
      phoneVerified: true,
    });
    (settingsService.updateProfile as jest.Mock).mockResolvedValue({});
    (settingsService.requestPhoneOtp as jest.Mock).mockResolvedValue({
      destination: '+965 •••••586',
    });
    (settingsService.requestEmailOtp as jest.Mock).mockResolvedValue({
      destination: 'salemelshekh@gmail.com',
    });
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'salemelshekh@gmail.com',
        phone: '+96558094586',
        whatsapp: '+96558094586',
      } as any,
      activeIdentity: mockCompanyIdentity as any,
      refreshProfile: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  it('renders all sections and input labels matching Figma 4410:159865', async () => {
    const { getByText, getByPlaceholderText, queryByText } = await render(
      <CompanyEditProfile />,
    );

    // Header & Section titles
    expect(getByText('تعديل الملف الشخصي')).toBeTruthy();
    expect(getByText('عن الشركة')).toBeTruthy();
    expect(getByText('الرخصة')).toBeTruthy();

    // Section 1: عن الشركة labels
    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('البريد الالكتروني')).toBeTruthy();
    expect(getByText('رقم الهاتف')).toBeTruthy();
    // No WhatsApp for companies/offices: phone or in-app chat only
    expect(queryByText('رقم الواتساب')).toBeNull();
    expect(getByText('المقر الرئيسي')).toBeTruthy();
    expect(getByText('مناطق تقديم الخدمة')).toBeTruthy();
    expect(getByText('نبذة عن الشركة')).toBeTruthy();
    expect(getByText('مواعيد العمل')).toBeTruthy();

    // Section 2: الرخصة labels
    expect(getByText('النشاط')).toBeTruthy();
    expect(getByText('رقم الرخصة')).toBeTruthy();
    expect(getByText('تاريخ انتهاء')).toBeTruthy();
    expect(getByText('الصورة')).toBeTruthy();

    // Input placeholders (neutral, per design typography)
    expect(getByPlaceholderText('أدخل اسم الشركة')).toBeTruthy();
    expect(getByPlaceholderText('ادخل البريد الالكتروني')).toBeTruthy();
    expect(getByText('حفظ التغييرات')).toBeTruthy();
  });

  // QA: النشاط offered an old hard-coded list; it's the services
  // catalogue's specialties now, as إضافة خدمة and طلب عرض سعر
  it('النشاط offers the services catalogue specialties', async () => {
    const { getByText, queryByText } = await render(<CompanyEditProfile />);

    // The saved, older activity still shows until it's changed
    await fireEvent.press(getByText('تشطيبات'));

    expect(getByText('مكتب هندسي')).toBeTruthy();
    expect(queryByText('تشطيبات،بناء،ديكور،كهرباء')).toBeNull();
  });

  // مناطق تقديم الخدمة mixed governorates with two single areas
  it('مناطق تقديم الخدمة offers all of Kuwait or a governorate', async () => {
    const { getByText, getAllByText, queryAllByText } = await render(
      <CompanyEditProfile />,
    );
    // السالمية is also the HQ's address on this screen: count it before
    const salmiyaBefore = queryAllByText('السالمية').length;

    await fireEvent.press(getByText('العاصمة'));

    expect(getByText('جميع مناطق الكويت')).toBeTruthy();
    for (const governorate of ['حولي', 'الأحمدي', 'الجهراء', 'الفروانية', 'مبارك الكبير']) {
      expect(getByText(governorate)).toBeTruthy();
    }
    // The saved one shows in the field and in the list
    expect(getAllByText('العاصمة').length).toBeGreaterThan(1);
    // Single areas aren't offered any more
    expect(queryAllByText('السالمية').length).toBe(salmiyaBefore);
    expect(queryAllByText('شمال غرب صليبيخات')).toHaveLength(0);
  });

  it('Save button stays disabled when unmodified (Figma 4410:159865)', async () => {
    const { getByText } = await render(<CompanyEditProfile />);

    fireEvent.press(getByText('حفظ التغييرات'));

    // Since nothing changed, neither endpoint should be hit
    expect(settingsService.updateProfile).not.toHaveBeenCalled();
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('sends user fields to /users/profile and licence fields to /identities/:id', async () => {
    const { getByDisplayValue, getByTestId } = await render(
      <CompanyEditProfile />,
    );

    // Modify the company name (a user field) and the licence number (an
    // identity field) in one save
    await fireEvent.changeText(
      getByDisplayValue('دار العقار الحديث'),
      'دار العقار الجديد',
    );
    await fireEvent.changeText(getByDisplayValue('6743963845'), '1234567890');

    await waitFor(() => {
      expect(getByTestId('save-button').props.accessibilityState?.disabled).toBe(
        false,
      );
    });
    await fireEvent.press(getByTestId('save-button'));

    await waitFor(() =>
      expect(settingsService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'دار العقار الجديد',
        }),
      ),
    );

    // REGRESSION: the licence fields must never reach the profile endpoint --
    // UpdateProfileDto rejects unknown properties with a 400
    const userCall = (settingsService.updateProfile as jest.Mock).mock
      .calls[0][0];
    expect(userCall.licenseNumber).toBeUndefined();
    expect(userCall.licenseActivity).toBeUndefined();
    expect(userCall.licenseExpiry).toBeUndefined();

    // The licence change goes to the identities endpoint (multipart, since
    // this screen always posts the identity save as a form)
    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/identities/identity-123',
        expect.anything(),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      ),
    );
  });

  it('a changed phone is verified by SMS before anything saves', async () => {
    const { getByDisplayValue, getAllByDisplayValue, getByTestId } = await render(
      <CompanyEditProfile />,
    );

    await fireEvent.changeText(
      getByDisplayValue('دار العقار الحديث'),
      'دار العقار الجديد',
    );
    // Phone and whatsapp share the same default number -- the phone field
    // renders first
    await fireEvent.changeText(
      getAllByDisplayValue('58094586')[0],
      '51234567',
    );

    await waitFor(() => {
      expect(getByTestId('save-button').props.accessibilityState?.disabled).toBe(
        false,
      );
    });
    await fireEvent.press(getByTestId('save-button'));

    // The OTP request goes out (formatted international) and the sheet opens;
    // no profile save happens until the code checks out
    await waitFor(() =>
      expect(settingsService.requestPhoneOtp).toHaveBeenCalledWith(
        '+96551234567',
      ),
    );
    expect(mockPresent).toHaveBeenCalled();
    expect(settingsService.updateProfile).not.toHaveBeenCalled();
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('a new email surfaces the code link and blocks saving until verified', async () => {
    const alertSpy = jest.spyOn(useAlertStore.getState(), 'showAlert');
    const { getByDisplayValue, getByTestId, queryByTestId } = await render(
      <CompanyEditProfile />,
    );

    // A new address surfaces the "ارسال رمز التحقق" link
    await fireEvent.changeText(
      getByDisplayValue('salemelshekh@gmail.com'),
      'new@example.com',
    );
    await waitFor(() =>
      expect(queryByTestId('send-email-otp-link')).toBeTruthy(),
    );

    // Saving is blocked with an alert -- no endpoint is hit
    await fireEvent.changeText(
      getByDisplayValue('دار العقار الحديث'),
      'شركة جديدة',
    );
    await fireEvent.press(getByTestId('save-button'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'تنبيه',
        'يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.',
      ),
    );
    expect(settingsService.updateProfile).not.toHaveBeenCalled();
    expect(apiClient.patch).not.toHaveBeenCalled();
  });

  it('المقر الرئيسي is picked on the map; its address and point are saved', async () => {
    const { getByTestId, getByText } = await render(<CompanyEditProfile />);

    await fireEvent.press(getByTestId('hq-location-field'));
    expect(mockMapProps.visible).toBe(true);
    await act(async () => {
      mockMapProps.onConfirm('حولي - السالمية', 29.3376, 48.0759);
    });
    expect(getByText('حولي - السالمية')).toBeTruthy();

    await waitFor(() =>
      expect(
        getByTestId('save-button').props.accessibilityState?.disabled,
      ).toBe(false),
    );
    await fireEvent.press(getByTestId('save-button'));

    await waitFor(() =>
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/identities/identity-123',
        expect.anything(),
        expect.anything(),
      ),
    );
    const body: FormData = (apiClient.patch as jest.Mock).mock.calls.find(
      ([url]: [string]) => url === '/identities/identity-123',
    )[1];
    expect(body.get('hqLocation')).toBe('حولي - السالمية');
    expect(body.get('latitude')).toBe('29.3376');
    expect(body.get('longitude')).toBe('48.0759');
  });
});
