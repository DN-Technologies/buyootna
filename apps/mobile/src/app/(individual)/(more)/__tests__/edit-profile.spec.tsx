import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';

import { settingsService } from '@/shared/api/settings.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import EditProfileScreen from '../edit-profile';

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

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: mockRouterPush,
    replace: jest.fn(),
  }),
  // Runs once like a first focus; refocus resets are covered below
  useFocusEffect: (cb: () => void | (() => void)) => {
    const { useEffect } = jest.requireActual('react');
    useEffect(cb, []);
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
    (settingsService.requestEmailOtp as jest.Mock).mockImplementation(
      (email: string) => Promise.resolve({ destination: email }),
    );
    (settingsService.verifyEmail as jest.Mock).mockResolvedValue({});
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

    const phoneSheet = within(getByTestId('phone-otp-sheet'));
    await fireEvent.changeText(
      phoneSheet.getByTestId('otp-hidden-input'),
      '123456',
    );
    await fireEvent.press(phoneSheet.getByText('التحقق من الرمز'));

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

  it('lets a user who signed up with a phone (no email) save', async () => {
    // A phone sign-up starts on the PHONE method: the email is optional
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
      loginMethod: 'PHONE',
      email: null,
      phone: '+96555100001',
      phoneVerified: true,
    });
    useAuthStore.setState({
      user: { id: 'user-3', email: null, phone: '+96555100001' } as any,
      activeIdentity: {
        id: 'id-ind-3',
        type: 'INDIVIDUAL',
        individualData: { name: 'محمد علي', whatsapp: '55100001' },
      } as any,
      refreshProfile: jest.fn().mockResolvedValue(undefined),
    } as any);
    const {
      getByDisplayValue,
      getByText,
      getAllByText,
      queryByTestId,
      findByText,
    } = await render(<EditProfileScreen />);

    expect(
      await findByText(
        'طريقة تسجيل الدخول لديك: رقم الهاتف، لذلك الرقم مطلوب، والبريد الإلكتروني اختياري.',
      ),
    ).toBeTruthy();
    // Email (phone sign-in) and WhatsApp (always) are the optional ones
    expect(getAllByText('(اختياري)', { exact: false })).toHaveLength(2);
    await fireEvent.changeText(getByDisplayValue('محمد علي'), 'محمد سالم');
    // An empty email needs no code
    expect(queryByTestId('send-email-otp-link')).toBeNull();
    await fireEvent.press(getByText('تعديل البيانات'));

    await waitFor(() =>
      expect(settingsService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'محمد سالم', email: undefined }),
      ),
    );
  });

  // QA: clearing the email saved "successfully" and the address came back
  it('removes the email when a phone sign-in user clears the field', async () => {
    (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
      loginMethod: 'PHONE',
      email: 'old@mail.com',
      phone: '+96555100001',
      phoneVerified: true,
    });
    useAuthStore.setState({
      user: { id: 'user-3', email: 'old@mail.com', phone: '+96555100001' } as any,
      activeIdentity: {
        id: 'id-ind-3',
        type: 'INDIVIDUAL',
        individualData: { name: 'محمد علي', whatsapp: '55100001' },
      } as any,
      refreshProfile: jest.fn().mockResolvedValue(undefined),
    } as any);
    const { getByDisplayValue, getByText, findByText } = await render(
      <EditProfileScreen />,
    );
    await findByText('(اختياري)', { exact: false }).catch(() => undefined);

    await fireEvent.changeText(getByDisplayValue('old@mail.com'), '');
    await fireEvent.press(getByText('تعديل البيانات'));

    await waitFor(() =>
      expect(settingsService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ email: null }),
      ),
    );
  });

  it('a new email must be verified with its code before saving', async () => {
    signedIn();
    const { getByTestId, getByText, findByText, queryByTestId } = await render(
      <EditProfileScreen />,
    );

    await fireEvent.changeText(
      getByTestId('edit-profile-email'),
      'New@Mail.com',
    );

    // Saving first only asks for the code
    await fireEvent.press(getByText('تعديل البيانات'));
    expect(
      await findByText('يرجى التحقق من البريد الإلكتروني قبل حفظ التغييرات.'),
    ).toBeTruthy();
    expect(settingsService.updateProfile).not.toHaveBeenCalled();

    await fireEvent.press(getByTestId('send-email-otp-link'));
    await waitFor(() =>
      expect(settingsService.requestEmailOtp).toHaveBeenCalledWith(
        'New@Mail.com',
      ),
    );

    const emailSheet = within(getByTestId('email-otp-sheet'));
    expect(emailSheet.getByText('تحقق من البريد الإلكتروني')).toBeTruthy();
    await fireEvent.changeText(
      emailSheet.getByTestId('otp-hidden-input'),
      '654321',
    );
    await fireEvent.press(emailSheet.getByText('التحقق من الرمز'));

    await waitFor(() =>
      expect(settingsService.verifyEmail).toHaveBeenCalledWith(
        'New@Mail.com',
        '654321',
      ),
    );
    expect(
      await findByText('تم التحقق من البريد الالكتروني بنجاح.'),
    ).toBeTruthy();
    expect(queryByTestId('send-email-otp-link')).toBeNull();

    await fireEvent.press(getByText('تعديل البيانات'));
    await waitFor(() =>
      expect(settingsService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'New@Mail.com' }),
      ),
    );
  });

  it('shows a wrong email address as an error, with no code link', async () => {
    signedIn();
    const { getByTestId, findByText, queryByTestId } = await render(
      <EditProfileScreen />,
    );

    await fireEvent.changeText(getByTestId('edit-profile-email'), 'not-an-email');

    expect(await findByText('بريد الكتروني غير صالح')).toBeTruthy();
    expect(queryByTestId('send-email-otp-link')).toBeNull();
  });

  describe('required fields follow the sign-in method', () => {
    const withMethod = (loginMethod: string) =>
      (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
        loginMethod,
        email: 'user@test.com',
        phone: '+96555100001',
        phoneVerified: true,
      });

    it('BOTH: an empty email is refused with a toast, nothing saved', async () => {
      withMethod('BOTH');
      signedIn();
      const { getByTestId, getByText, findByText } = await render(
        <EditProfileScreen />,
      );
      await findByText(
        'طريقة تسجيل الدخول لديك: البريد الإلكتروني أو رقم الهاتف، لذلك كلاهما مطلوب.',
      );

      await fireEvent.changeText(getByTestId('edit-profile-email'), '');
      await fireEvent.press(getByText('تعديل البيانات'));

      expect(
        await findByText('البريد الإلكتروني مطلوب حسب طريقة تسجيل الدخول لديك.'),
      ).toBeTruthy();
      expect(settingsService.updateProfile).not.toHaveBeenCalled();
    });

    // QA: an account registered with an email only could not save its name
    // until it added a phone. Signing in by email, the phone is optional
    it('EMAIL: the phone is optional; an account without one saves its name', async () => {
      (settingsService.getLoginMethod as jest.Mock).mockResolvedValue({
        loginMethod: 'EMAIL',
        email: 'user@test.com',
        phone: null,
        phoneVerified: false,
      });
      useAuthStore.setState({
        user: { id: 'user-4', email: 'user@test.com', phone: null } as any,
        activeIdentity: {
          id: 'id-ind-4',
          type: 'INDIVIDUAL',
          individualData: { name: 'محمد علي', whatsapp: null },
        } as any,
        refreshProfile: jest.fn().mockResolvedValue(undefined),
      } as any);
      const { getByDisplayValue, getByText, findByText, queryByText } =
        await render(<EditProfileScreen />);
      await findByText(
        'طريقة تسجيل الدخول لديك: البريد الإلكتروني، لذلك البريد مطلوب، ورقم الهاتف اختياري.',
      );

      await fireEvent.changeText(getByDisplayValue('محمد علي'), 'محمد سالم');
      await fireEvent.press(getByText('تعديل البيانات'));

      await waitFor(() =>
        expect(settingsService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'محمد سالم' }),
        ),
      );
      expect(queryByText('رقم الهاتف مطلوب للتواصل معك.')).toBeNull();
      expect(settingsService.requestPhoneOtp).not.toHaveBeenCalled();
    });

    it('PHONE: an empty phone is refused with a toast', async () => {
      withMethod('PHONE');
      signedIn();
      const { getByDisplayValue, getByText, findByText } = await render(
        <EditProfileScreen />,
      );
      await findByText(
        'طريقة تسجيل الدخول لديك: رقم الهاتف، لذلك الرقم مطلوب، والبريد الإلكتروني اختياري.',
      );

      await fireEvent.changeText(getByDisplayValue('+96555100001'), '');
      await fireEvent.press(getByText('تعديل البيانات'));

      expect(
        await findByText('رقم الهاتف مطلوب للتواصل معك.'),
      ).toBeTruthy();
      expect(settingsService.updateProfile).not.toHaveBeenCalled();
    });

    // QA: clearing WhatsApp blocked saving ("رقم الواتساب مطلوب")
    it('WhatsApp is optional: cleared, the profile still saves', async () => {
      withMethod('BOTH');
      signedIn();
      const { getByDisplayValue, getByText, queryByText } = await render(
        <EditProfileScreen />,
      );

      await fireEvent.changeText(getByDisplayValue('55100001'), '');
      await fireEvent.press(getByText('تعديل البيانات'));

      await waitFor(() =>
        expect(settingsService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({ whatsapp: '' }),
        ),
      );
      expect(queryByText('رقم الواتساب مطلوب')).toBeNull();
    });

    it('requires nothing extra when the method could not be loaded', async () => {
      (settingsService.getLoginMethod as jest.Mock).mockRejectedValue(
        new Error('offline'),
      );
      signedIn();
      const { getByTestId, getByText, queryByTestId } = await render(
        <EditProfileScreen />,
      );

      await fireEvent.changeText(getByTestId('edit-profile-email'), '');
      await fireEvent.press(getByText('تعديل البيانات'));

      await waitFor(() =>
        expect(settingsService.updateProfile).toHaveBeenCalled(),
      );
      expect(queryByTestId('login-method-note')).toBeNull();
    });

    it('the note opens Settings to change the method', async () => {
      withMethod('PHONE');
      signedIn();
      const { findByTestId } = await render(<EditProfileScreen />);

      await fireEvent.press(await findByTestId('login-method-note-settings'));

      expect(mockRouterPush).toHaveBeenCalledWith('/settings');
    });
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
    // Optional now, so the label carries '(اختياري)'
    expect(getByText('رقم الواتساب', { exact: false })).toBeTruthy();
    expect(getByText('تعديل البيانات')).toBeTruthy();
    expect(getByPlaceholderText('أدخل اسمك')).toBeTruthy();
  });
});
