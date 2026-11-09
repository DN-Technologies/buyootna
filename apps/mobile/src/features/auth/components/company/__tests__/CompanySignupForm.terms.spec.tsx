// QA: «إضافة حساب» › شركة / مكتب showed the terms box but created the
// profile with it unticked. The form itself now requires it, in every flow.
import { act, fireEvent, render } from '@testing-library/react-native';

import { useTermsAgreement } from '@/features/auth/terms';
import { useAlertStore } from '@/shared/store/useAlertStore';

import { CompanySignupForm } from '../CompanySignupForm';

// The steps' fields are valid; only the terms are under test
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
        fn({ type: 'company' }),
  }),
}));
jest.mock('../CompanySignupSteps', () => ({
  SignupStep1: () => null,
  SignupStep2: () => null,
  SignupStep3: () => null,
}));
jest.mock('@/shared/components/map/MapPickerModal', () => () => null);
jest.mock('@/shared/components/feedback/SelectionBottomSheet', () => () => null);
jest.mock('@/shared/components/feedback/SuccessBottomSheet', () => () => null);

async function reachLastStep(includeAccountFields: boolean) {
  const onSubmit = jest.fn().mockResolvedValue(true);
  const screen = await render(
    <CompanySignupForm
      type="company"
      onSubmit={onSubmit}
      logoFile={null}
      pickLogo={jest.fn()}
      includeAccountFields={includeAccountFields}
    />,
  );
  await act(async () => fireEvent.press(screen.getByText('التالي')));
  await act(async () => fireEvent.press(screen.getByText('التالي')));
  return { screen, onSubmit };
}

describe('CompanySignupForm terms', () => {
  let showAlert: jest.SpyInstance;
  beforeEach(() => {
    showAlert = jest
      .spyOn(useAlertStore.getState(), 'showAlert')
      .mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['«إضافة حساب» (a logged-in account)', false, 'إضافة الهوية'],
    ['sign-up', true, 'إنشاء حساب'],
  ])('%s: unticked, nothing is sent and it says why', async (_, include, label) => {
    const { screen, onSubmit } = await reachLastStep(include);
    await act(async () => fireEvent.press(screen.getByText(label)));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith(
      'الموافقة على الشروط',
      'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
    );
  });

  it('ticked, the profile is sent', async () => {
    const { screen, onSubmit } = await reachLastStep(false);
    await act(async () =>
      fireEvent.press(screen.getByTestId('terms-agreement-checkbox')),
    );
    await act(async () => fireEvent.press(screen.getByText('إضافة الهوية')));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('starts unticked, even if ticked earlier in the session', async () => {
    useTermsAgreement.getState().setAccepted(true);
    const { screen, onSubmit } = await reachLastStep(false);

    expect(
      screen.getByTestId('terms-agreement-checkbox').props.accessibilityState,
    ).toEqual({ checked: false });
    await act(async () => fireEvent.press(screen.getByText('إضافة الهوية')));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
