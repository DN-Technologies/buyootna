import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';

import apiClient from '@/shared/api/api';
import { useAlertStore } from '@/shared/store/useAlertStore';
import { useAuthStore } from '@/shared/store/useAuthStore';

import IndividualAuthScreen from '../individual-auth';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  validateApiUrl: jest.fn(() => 'http://localhost:8000'),
  setAuthToken: jest.fn(),
  setOnUnauthorized: jest.fn(),
}));

jest.mock('@/shared/services/socket.service', () => ({
  socketService: { connect: jest.fn(), disconnect: jest.fn() },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  // useIdentity.ts (used internally by the always-mounted ProfileBottomSheet)
  // also imports the pure display-name/avatar/verified helpers from this
  // module — keep the real implementations, only mock the hook itself.
  ...jest.requireActual('@/shared/store/useAuthStore'),
  useAuthStore: jest.fn(),
}));

jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockUseAuthStore = useAuthStore as unknown as jest.Mock;
const mockSetAuth = jest.fn();

const activeIdentity = {
  id: 'identity-1',
  type: 'INDIVIDUAL',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
const loginResponseData = {
  user: { id: 'user-1' },
  activeIdentity,
  identities: [activeIdentity],
  access_token: 'tok-1',
  sessionId: 'session-1',
};

describe('IndividualAuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAuth.mockResolvedValue(undefined);
    const authState = {
      setAuth: mockSetAuth,
      activeIdentity: null,
      identities: [] as unknown[],
      switchIdentity: jest.fn(),
      addIdentity: jest.fn(),
      removeIdentity: jest.fn(),
      updateActiveIdentity: jest.fn(),
    };
    // useAuthStore is called both with a selector (this screen) and without
    // one (useIdentity, used internally by the always-mounted
    // ProfileBottomSheet) — support both call shapes.
    mockUseAuthStore.mockImplementation((selector?: (s: typeof authState) => unknown) =>
      selector ? selector(authState) : authState,
    );
    jest.spyOn(useAlertStore.getState(), 'showAlert').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const fillLoginForm = async (
    getByPlaceholderText: any,
    identifier: string,
    password: string,
  ) => {
    await fireEvent.changeText(
      getByPlaceholderText('alisalem@gmail.com'),
      identifier,
    );
    await fireEvent.changeText(getByPlaceholderText('**************'), password);
  };

  describe('login', () => {
    it('logs in successfully and navigates to the identity home route', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: loginResponseData });
      const { getByPlaceholderText, getByText } = await render(
        <IndividualAuthScreen />,
      );

      await fillLoginForm(getByPlaceholderText, 'ali@example.com', 'password123');
      await fireEvent.press(getByText('تسجيل الدخول'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
          identifier: 'ali@example.com',
          password: 'password123',
          identityType: 'INDIVIDUAL',
        });
      });
      await waitFor(() =>
        expect(mockSetAuth).toHaveBeenCalledWith(
          loginResponseData.user,
          loginResponseData.activeIdentity,
          loginResponseData.identities,
          loginResponseData.access_token,
          loginResponseData.sessionId,
        ),
      );
      expect(router.replace).toHaveBeenCalledWith('/(individual)/home');
    });

    it('joins an array-shaped backend error message with newlines', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        response: { data: { message: ['a', 'b'] } },
      });
      const { getByPlaceholderText, getByText } = await render(
        <IndividualAuthScreen />,
      );

      await fillLoginForm(getByPlaceholderText, 'ali@example.com', 'password123');
      await fireEvent.press(getByText('تسجيل الدخول'));

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith('فشل تسجيل الدخول', 'a\nb');
      });
    });

    it('shows the generic connectivity message on a network error', async () => {
      mockApiClient.post.mockRejectedValueOnce({ message: 'Network Error' });
      const { getByPlaceholderText, getByText } = await render(
        <IndividualAuthScreen />,
      );

      await fillLoginForm(getByPlaceholderText, 'ali@example.com', 'password123');
      await fireEvent.press(getByText('تسجيل الدخول'));

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
          'فشل تسجيل الدخول',
          'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
        );
      });
    });
  });

  describe('login to an account deactivated for a period', () => {
    const scheduled = {
      response: {
        status: 409,
        data: {
          code: 'ACCOUNT_SCHEDULED_DEACTIVATION',
          message: 'حسابك معطل حالياً وسيُعاد تفعيله تلقائياً خلال 3 أيام. هل تريد إلغاء التعطيل وتسجيل الدخول الآن؟',
          daysLeft: 3,
          reactivationTicket: 'ticket-1',
        },
      },
    };

    // Signs in, then answers the "reactivate now?" question
    const loginAndAnswer = async (answer: 'نعم، إعادة التفعيل' | 'لا') => {
      const showAlert = useAlertStore.getState().showAlert as jest.Mock;
      const { getByPlaceholderText, getByText } = await render(
        <IndividualAuthScreen />,
      );
      await fillLoginForm(getByPlaceholderText, 'ali@example.com', 'password123');
      await fireEvent.press(getByText('تسجيل الدخول'));

      await waitFor(() =>
        expect(showAlert).toHaveBeenCalledWith(
          'الحساب معطل مؤقتاً',
          scheduled.response.data.message,
          expect.any(Array),
        ),
      );
      const buttons = showAlert.mock.calls[0][2] as {
        text: string;
        onPress: () => void;
      }[];
      await act(async () => {
        buttons.find((b) => b.text === answer)!.onPress();
      });
    };

    it('"yes" reactivates with the ticket and signs in', async () => {
      mockApiClient.post
        .mockRejectedValueOnce(scheduled)
        .mockResolvedValueOnce({ data: { ...loginResponseData, reactivated: true } });

      await loginAndAnswer('نعم، إعادة التفعيل');

      await waitFor(() =>
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reactivate', {
          ticket: 'ticket-1',
        }),
      );
      await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      expect(router.replace).toHaveBeenCalledWith('/(individual)/home');
    });

    it('"no" stays on the login screen without an error', async () => {
      mockApiClient.post.mockRejectedValueOnce(scheduled);

      await loginAndAnswer('لا');

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockSetAuth).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
      // Only the question was shown, no "login failed"
      expect(useAlertStore.getState().showAlert).toHaveBeenCalledTimes(1);
    });

    it('shows the admin-suspension message as it comes (403)', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            code: 'ACCOUNT_SUSPENDED_BY_ADMIN',
            message: 'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.',
          },
        },
      });
      const { getByPlaceholderText, getByText } = await render(
        <IndividualAuthScreen />,
      );
      await fillLoginForm(getByPlaceholderText, 'ali@example.com', 'password123');
      await fireEvent.press(getByText('تسجيل الدخول'));

      await waitFor(() =>
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
          'فشل تسجيل الدخول',
          'تم إيقاف حسابك من قبل الإدارة. يرجى التواصل مع الدعم.',
        ),
      );
    });
  });

  describe('signup', () => {
    const switchToSignup = async (getByText: any) => {
      await fireEvent.press(getByText('تسجيل جديد'));
    };

    it('with an email identifier: only registers, then shows the OTP step', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { otpRequired: true, identifier: 'ali@example.com' },
      });
      const { getByPlaceholderText, getAllByPlaceholderText, getByText } =
        await render(<IndividualAuthScreen />);

      await switchToSignup(getByText);
      await fireEvent.changeText(
        getByPlaceholderText('علي سالم'),
        'Ali Salem',
      );
      await fireEvent.changeText(
        getByPlaceholderText('alisalem@gmail.com'),
        'ali@example.com',
      );
      const passwordInputs = getAllByPlaceholderText('**************');
      await fireEvent.changeText(passwordInputs[0], 'Password123!');
      await fireEvent.changeText(passwordInputs[1], 'Password123!');
      await fireEvent.press(getByText('إنشاء حساب'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/users/register/individual',
          { name: 'Ali Salem', identifier: 'ali@example.com', password: 'Password123!' },
        );
      });
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(getByText('التحقق من الرمز')).toBeTruthy();
      });
      expect(mockSetAuth).not.toHaveBeenCalled();
    });

    it('with a phone identifier: only registers, then shows the OTP step', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { message: 'registered' } });
      const { getByPlaceholderText, getAllByPlaceholderText, getByText } =
        await render(<IndividualAuthScreen />);

      await switchToSignup(getByText);
      await fireEvent.changeText(
        getByPlaceholderText('علي سالم'),
        'Ali Salem',
      );
      await fireEvent.changeText(
        getByPlaceholderText('alisalem@gmail.com'),
        '51234567',
      );
      const passwordInputs = getAllByPlaceholderText('**************');
      await fireEvent.changeText(passwordInputs[0], 'Password123!');
      await fireEvent.changeText(passwordInputs[1], 'Password123!');
      await fireEvent.press(getByText('إنشاء حساب'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/users/register/individual',
          { name: 'Ali Salem', identifier: '51234567', password: 'Password123!' },
        );
      });
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(getByText('التحقق من الرمز')).toBeTruthy();
      });
    });

    describe('OTP step', () => {
      const advanceToOtpStep = async (
        getByPlaceholderText: any,
        getAllByPlaceholderText: any,
        getByText: any,
      ) => {
        mockApiClient.post.mockResolvedValueOnce({
          data: { message: 'registered' },
        });
        await switchToSignup(getByText);
        await fireEvent.changeText(
          getByPlaceholderText('علي سالم'),
          'Ali Salem',
        );
        await fireEvent.changeText(
          getByPlaceholderText('alisalem@gmail.com'),
          '51234567',
        );
        const passwordInputs = getAllByPlaceholderText('**************');
        await fireEvent.changeText(passwordInputs[0], 'Password123!');
        await fireEvent.changeText(passwordInputs[1], 'Password123!');
        await fireEvent.press(getByText('إنشاء حساب'));
        await waitFor(() => getByText('التحقق من الرمز'));
        mockApiClient.post.mockClear();
      };

      it('verifying the OTP calls verify-otp then setAuth', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: loginResponseData });
        const { getByPlaceholderText, getAllByPlaceholderText, getByText, getByDisplayValue } =
          await render(<IndividualAuthScreen />);
        await advanceToOtpStep(getByPlaceholderText, getAllByPlaceholderText, getByText);

        const hiddenOtpInput = getByDisplayValue('');
        await fireEvent.changeText(hiddenOtpInput, '123456');
        await fireEvent.press(getByText('التحقق من الرمز'));

        await waitFor(() => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/auth/register/verify-otp',
            { phone: '51234567', otp: '123456' },
          );
        });
        await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      });

      // Regression coverage for the reported bug: a dropped connection
      // (no `response` on the thrown error) must not be reported as
      // "invalid verification code" -- the user typed nothing wrong, their
      // network just failed.
      it('shows a network-error message, not "invalid code", when verify-otp fails with no response', async () => {
        const { getByPlaceholderText, getAllByPlaceholderText, getByText, getByDisplayValue } =
          await render(<IndividualAuthScreen />);
        await advanceToOtpStep(getByPlaceholderText, getAllByPlaceholderText, getByText);
        mockApiClient.post.mockRejectedValueOnce({ message: 'Network Error' });

        const hiddenOtpInput = getByDisplayValue('');
        await fireEvent.changeText(hiddenOtpInput, '123456');
        await fireEvent.press(getByText('التحقق من الرمز'));

        await waitFor(() => {
          expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
            'خطأ في التحقق',
            'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
          );
        });
        expect(mockSetAuth).not.toHaveBeenCalled();
      });

      it('resend re-runs the registration call with the stashed name and phone (no account exists until OTP verifies)', async () => {
        // Fake timers must be active BEFORE the OTP step mounts its 45s
        // countdown interval — switching mid-test can't retroactively
        // convert an already-scheduled real setInterval into a fake one.
        jest.useFakeTimers();
        const { getByPlaceholderText, getAllByPlaceholderText, getByText } =
          await render(<IndividualAuthScreen />);
        await advanceToOtpStep(getByPlaceholderText, getAllByPlaceholderText, getByText);
        mockApiClient.post.mockResolvedValueOnce({ data: {} });

        await act(async () => {
          jest.advanceTimersByTime(45000);
        });
        await fireEvent.press(getByText('إعادة إرسال الرمز'));
        jest.useRealTimers();

        await waitFor(() => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/users/register/individual',
            {
              name: 'Ali Salem',
              identifier: '51234567',
              password: 'Password123!',
            },
          );
        });
      });
    });

    describe('OTP step (email)', () => {
      const advanceToEmailOtpStep = async (
        getByPlaceholderText: any,
        getAllByPlaceholderText: any,
        getByText: any,
      ) => {
        mockApiClient.post.mockResolvedValueOnce({
          data: { otpRequired: true, identifier: 'ali@example.com' },
        });
        await switchToSignup(getByText);
        await fireEvent.changeText(
          getByPlaceholderText('علي سالم'),
          'Ali Salem',
        );
        await fireEvent.changeText(
          getByPlaceholderText('alisalem@gmail.com'),
          'ali@example.com',
        );
        const passwordInputs = getAllByPlaceholderText('**************');
        await fireEvent.changeText(passwordInputs[0], 'Password123!');
        await fireEvent.changeText(passwordInputs[1], 'Password123!');
        await fireEvent.press(getByText('إنشاء حساب'));
        await waitFor(() => getByText('التحقق من الرمز'));
        mockApiClient.post.mockClear();
      };

      it('verifying the OTP calls verify-email-otp then setAuth', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: loginResponseData });
        const { getByPlaceholderText, getAllByPlaceholderText, getByText, getByDisplayValue } =
          await render(<IndividualAuthScreen />);
        await advanceToEmailOtpStep(getByPlaceholderText, getAllByPlaceholderText, getByText);

        const hiddenOtpInput = getByDisplayValue('');
        await fireEvent.changeText(hiddenOtpInput, '123456');
        await fireEvent.press(getByText('التحقق من الرمز'));

        await waitFor(() => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/auth/register/verify-email-otp',
            { email: 'ali@example.com', otp: '123456' },
          );
        });
        await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      });

      it('resend re-posts to register/individual with the same identifier and password (no account exists yet)', async () => {
        jest.useFakeTimers();
        const { getByPlaceholderText, getAllByPlaceholderText, getByText } =
          await render(<IndividualAuthScreen />);
        await advanceToEmailOtpStep(getByPlaceholderText, getAllByPlaceholderText, getByText);
        mockApiClient.post.mockResolvedValueOnce({
          data: { otpRequired: true, identifier: 'ali@example.com' },
        });

        await act(async () => {
          jest.advanceTimersByTime(45000);
        });
        await fireEvent.press(getByText('إعادة إرسال الرمز'));
        jest.useRealTimers();

        await waitFor(() => {
          expect(mockApiClient.post).toHaveBeenCalledWith(
            '/users/register/individual',
            { name: 'Ali Salem', identifier: 'ali@example.com', password: 'Password123!' },
          );
        });
      });
    });
  });

  describe('Google sign-in', () => {
    it('shows a "not enabled" alert and never calls the API when unconfigured', async () => {
      const { getByTestId } = await render(<IndividualAuthScreen />);

      await fireEvent.press(getByTestId('social-auth-google-button'));

      expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
        'تسجيل الدخول عبر Google غير مُفعّل حالياً',
      );
      expect(GoogleSignin.signIn).not.toHaveBeenCalled();
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    // NOTE: GOOGLE_SIGNIN_CONFIGURED and GoogleSignin.configure() are
    // evaluated once at module-import time from
    // EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (unset in this test env, so every
    // test in this file exercises the "unconfigured" branch above). Testing
    // the "configured" branch (hasPlayServices/signIn success, cancellation)
    // would require re-importing the screen module with the env var set via
    // jest.isolateModules — but that also reloads React itself into a
    // separate module registry from the one @testing-library/react-native's
    // render() uses, producing "Invalid hook call" errors when the two are
    // mixed. Making that scenario testable would require refactoring the
    // production code to check the env var lazily (e.g. inside the handler)
    // instead of at import time, which is out of scope for a test-only
    // change — so it's intentionally not covered here.
  });

  describe('Apple sign-in', () => {
    it('signs in successfully and navigates home', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockResolvedValue({
        identityToken: 'apple-tok',
      });
      mockApiClient.post.mockResolvedValueOnce({ data: loginResponseData });
      const { getByTestId } = await render(<IndividualAuthScreen />);

      await fireEvent.press(getByTestId('social-auth-apple-button'));

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/auth/apple', {
          identityToken: 'apple-tok',
        });
      });
      await waitFor(() => expect(mockSetAuth).toHaveBeenCalled());
      expect(router.replace).toHaveBeenCalledWith('/(individual)/home');
    });

    it('silently ignores a user-cancelled sign-in', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue({
        code: 'ERR_REQUEST_CANCELED',
      });
      const { getByTestId } = await render(<IndividualAuthScreen />);

      await fireEvent.press(getByTestId('social-auth-apple-button'));
      await waitFor(() => {
        expect(AppleAuthentication.signInAsync).toHaveBeenCalled();
      });

      expect(useAlertStore.getState().showAlert).not.toHaveBeenCalled();
    });

    it('shows the raw error message (not the API-connection message) for a native, non-axios failure', async () => {
      (AppleAuthentication.signInAsync as jest.Mock).mockRejectedValue(
        new Error('device not supported'),
      );
      const { getByTestId } = await render(<IndividualAuthScreen />);

      await fireEvent.press(getByTestId('social-auth-apple-button'));

      await waitFor(() => {
        expect(useAlertStore.getState().showAlert).toHaveBeenCalledWith(
          'فشل تسجيل الدخول عبر Apple',
          'device not supported',
        );
      });
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Back button navigation', () => {
    it('calls router.back() when back button is pressed on login/step 1', async () => {
      const { getByTestId } = await render(<IndividualAuthScreen />);
      const backButton = getByTestId('auth-back-button');
      await fireEvent.press(backButton);
      expect(router.back).toHaveBeenCalled();
    });

    it('returns to step 1 when back button is pressed during signup OTP step', async () => {
      mockApiClient.post.mockResolvedValueOnce({
        data: { otpRequired: true, identifier: 'user@example.com' },
      });

      const { getByTestId, getByText, queryByText } = await render(
        <IndividualAuthScreen />,
      );

      // Switch to signup tab
      await fireEvent.press(getByText('تسجيل جديد'));

      // Fill signup form
      await fireEvent.changeText(
        getByTestId('individual-signup-name-input'),
        'Test User',
      );
      await fireEvent.changeText(
        getByTestId('individual-signup-identifier-input'),
        'user@example.com',
      );
      await fireEvent.changeText(
        getByTestId('individual-signup-password-input'),
        'Password123!',
      );
      await fireEvent.changeText(
        getByTestId('individual-signup-confirm-password-input'),
        'Password123!',
      );

      await fireEvent.press(getByText('إنشاء حساب'));

      await waitFor(() => {
        expect(getByText('تحقق من الرمز')).toBeTruthy();
      });

      // Press back button on OTP screen
      await fireEvent.press(getByTestId('auth-back-button'));

      // Should return to signup step 1 (form visible, OTP hidden)
      await waitFor(() => {
        expect(getByTestId('individual-signup-name-input')).toBeTruthy();
        expect(queryByText('تحقق من الرمز')).toBeNull();
      });
    });
  });
});
