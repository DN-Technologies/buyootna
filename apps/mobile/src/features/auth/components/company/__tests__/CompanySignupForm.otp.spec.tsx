// QA [Critical]: the company sign-up must end with the emailed code; the
// account (and «تم إنشاء حساب شركتك بنجاح») only after it.
import { act, fireEvent, render } from '@testing-library/react-native';

import { useTermsAgreement } from '@/features/auth/terms';

import { CompanySignupForm } from '../CompanySignupForm';

const mockPresent = jest.fn();
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: {},
    trigger: jest.fn().mockResolvedValue(true),
    setValue: jest.fn(),
    watch: jest.fn(),
    handleSubmit:
      (fn: (data: object) => unknown) =>
      () =>
        fn({ type: 'company', email: 'co@example.com' }),
  }),
}));
jest.mock('../CompanySignupSteps', () => ({
  SignupStep1: () => null,
  SignupStep2: () => null,
  SignupStep3: () => null,
}));
jest.mock('@/shared/components/map/MapPickerModal', () => () => null);
jest.mock('@/shared/components/feedback/SelectionBottomSheet', () => () => null);
jest.mock('@/shared/components/feedback/SuccessBottomSheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  return forwardRef(function Sheet(_: object, ref: unknown) {
    useImperativeHandle(ref, () => ({ present: mockPresent, dismiss: jest.fn() }));
    return null;
  });
});
// The code screen: one tap enters «123456»
jest.mock('../../individual/IndividualSignupOtpStep', () => ({
  IndividualSignupOtpStep: ({
    identifier,
    onSubmit,
  }: {
    identifier: string;
    onSubmit: (otp: string) => Promise<boolean>;
  }) => {
    const { Text, TouchableOpacity } = jest.requireActual('react-native');
    return (
      <TouchableOpacity onPress={() => void onSubmit('123456')}>
        <Text>{`otp-for-${identifier}`}</Text>
      </TouchableOpacity>
    );
  },
}));

async function signUp(onVerifyOtp: jest.Mock) {
  const screen = await render(
    <CompanySignupForm
      type="company"
      onSubmit={jest.fn().mockResolvedValue('otp')}
      logoFile={null}
      pickLogo={jest.fn()}
      otpEmail="co@example.com"
      onVerifyOtp={onVerifyOtp}
      onResendOtp={jest.fn()}
    />,
  );
  await act(async () => fireEvent.press(screen.getByText('التالي')));
  await act(async () => fireEvent.press(screen.getByText('التالي')));
  await act(async () =>
    fireEvent.press(screen.getByTestId('terms-agreement-checkbox')),
  );
  await act(async () => fireEvent.press(screen.getByText('إنشاء حساب')));
  return screen;
}

describe('CompanySignupForm › the emailed code comes last', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTermsAgreement.setState({ accepted: false });
  });

  it('«إنشاء حساب» shows the code screen, not the success sheet', async () => {
    const screen = await signUp(jest.fn());

    expect(screen.getByText('otp-for-co@example.com')).toBeTruthy();
    expect(screen.queryByText('إنشاء حساب')).toBeNull();
    expect(mockPresent).not.toHaveBeenCalled();
  });

  it('a wrong code keeps the code screen and shows no success', async () => {
    const screen = await signUp(jest.fn().mockResolvedValue(false));
    await act(async () => fireEvent.press(screen.getByText('otp-for-co@example.com')));
    expect(mockPresent).not.toHaveBeenCalled();
    expect(screen.getByText('otp-for-co@example.com')).toBeTruthy();
  });

  it('a right code shows «تم إنشاء حساب شركتك بنجاح»', async () => {
    const onVerify = jest.fn().mockResolvedValue(true);
    const screen = await signUp(onVerify);
    await act(async () => fireEvent.press(screen.getByText('otp-for-co@example.com')));
    expect(onVerify).toHaveBeenCalledWith('123456');
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
