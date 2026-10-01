import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import EditProfileScreen from '../edit-profile';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: {
    updateProfile: jest.fn(),
    getLoginMethod: jest.fn(),
    requestPhoneOtp: jest.fn(),
    verifyPhone: jest.fn(),
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

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
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
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const signedIn = () =>
  useAuthStore.setState({
    user: { id: 'user-2', email: 'user@test.com', phone: '+96555100001' } as any,
    activeIdentity: {
      id: 'id-ind-1',
      type: 'INDIVIDUAL',
      individualData: { name: 'محمد علي', whatsapp: '55100001' },
    } as any,
    refreshProfile: jest.fn().mockResolvedValue(undefined),
  } as any);

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
      loginMethod: 'BOTH',
      email: 'user@test.com',
      phone: '+96555100001',
      phoneVerified: true,
    });
    (settingsService.updateProfile as jest.Mock).mockResolvedValue({});
    (settingsService.requestPhoneOtp as jest.Mock).mockResolvedValue({
      destination: '+965 •••• 22',
    });
    (settingsService.verifyPhone as jest.Mock).mockResolvedValue({});
  });

  it('a new phone is verified by SMS before the profile is saved', async () => {
    signedIn();
    const { getByDisplayValue, getByText, getByTestId } = await render(
      <EditProfileScreen />,
    );

    await fireEvent.changeText(getByDisplayValue('+96555100001'), '55100022');
    expect(getByText('سنرسل رمز تحقق إلى الرقم الجديد عند الحفظ')).toBeTruthy();
    await fireEvent.press(getByText('تعديل البيانات'));

    await waitFor(() =>
      expect(settingsService.requestPhoneOtp).toHaveBeenCalledWith('55100022'),
    );
    expect(mockPresent).toHaveBeenCalled();
    expect(settingsService.updateProfile).not.toHaveBeenCalled();

    await fireEvent.changeText(getByTestId('otp-hidden-input'), '123456');
    await fireEvent.press(getByText('التحقق من الرمز'));

    await waitFor(() =>
      expect(settingsService.verifyPhone).toHaveBeenCalledWith(
        '55100022',
        '123456',
      ),
    );
    await waitFor(() =>
      expect(settingsService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '55100022' }),
      ),
    );
  });

  it('saves straight away when the phone is unchanged', async () => {
    signedIn();
    const { getByDisplayValue, getByText } = await render(<EditProfileScreen />);

    await fireEvent.changeText(getByDisplayValue('محمد علي'), 'محمد سالم');
    await fireEvent.press(getByText('تعديل البيانات'));

    await waitFor(() => expect(settingsService.updateProfile).toHaveBeenCalled());
    expect(settingsService.requestPhoneOtp).not.toHaveBeenCalled();
  });

  it('offers to verify a phone on file that is not verified', async () => {
    signedIn();
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
      loginMethod: 'BOTH',
      email: 'user@test.com',
      phone: '+96555100001',
      phoneVerified: false,
    });
    const { findByTestId } = await render(<EditProfileScreen />);

    await fireEvent.press(await findByTestId('verify-phone-link'));

    expect(settingsService.requestPhoneOtp).toHaveBeenCalledWith(
      '+96555100001',
    );
  });

  it('renders individual form inputs matching design', async () => {
    useAuthStore.setState({
      user: { id: 'user-2', email: 'user@test.com', phone: '+96555100001' } as any,
      activeIdentity: {
        id: 'id-ind-1',
        type: 'INDIVIDUAL',
        individualData: {
          name: 'محمد علي',
        },
      } as any,
    });

    const { getByText, getByPlaceholderText } = await render(<EditProfileScreen />);
    expect(getByText('تعديل الملف الشخصي')).toBeTruthy();
    expect(getByText('الاسم')).toBeTruthy();
    expect(getByText('البريد الالكتروني')).toBeTruthy();
    expect(getByText('رقم الهاتف')).toBeTruthy();
    expect(getByText('رقم الواتساب')).toBeTruthy();
    expect(getByText('تعديل البيانات')).toBeTruthy();
    expect(getByPlaceholderText('أدخل اسمك')).toBeTruthy();
  });
});
