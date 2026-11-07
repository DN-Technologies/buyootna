import { fireEvent, render, waitFor } from '@testing-library/react-native';

import CompanyVerificationAction from '../CompanyVerificationAction';
import CompleteVerificationScreen from '../CompleteVerificationScreen';
import { formatFileMeta, formatSubmittedAt } from '../format';
import SubmitVerificationSheet from '../SubmitVerificationSheet';
import {
  useCompanyVerification,
  verificationStateOf,
} from '../useCompanyVerification';
import {
  type VerificationRequest,
  verificationService,
} from '../verification.service';

jest.mock('@gorhom/bottom-sheet');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useRouter: () => jest.requireMock('expo-router').router,
  useFocusEffect: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file://license.jpg', name: 'license.jpg', size: 1000 }],
  }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (state: object) => unknown) =>
    select({ refreshProfile: jest.fn() }),
}));
jest.mock('../verification.service', () => ({
  verificationService: {
    get: jest.fn(),
    submit: jest.fn().mockResolvedValue({}),
    resubmit: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock('../useCompanyVerification', () => ({
  ...jest.requireActual('../useCompanyVerification'),
  useCompanyVerification: jest.fn(),
}));

const { showAlert } = jest.requireMock('@/shared/utils/alert');
// The sheets' present(), from __mocks__/@gorhom/bottom-sheet
const { present } = jest.requireMock('@gorhom/bottom-sheet');
const { router } = jest.requireMock('expo-router');
const mockUseVerification = useCompanyVerification as jest.Mock;

const request = (over: Partial<VerificationRequest> = {}) =>
  ({
    id: 'vr-1',
    status: 'PENDING',
    licenseActivity: 'الاستشارات الهندسية والتصميم',
    licenseNumber: '98576389',
    licenseExpiry: '19 مايو 2029',
    licenseFileUrl: 'https://cdn/license.jpg',
    licenseFileName: 'license.jpg',
    licenseFileSize: 204800,
    licenseFileType: 'application/pdf',
    issues: null,
    submittedAt: '2026-09-11T09:35:00',
    reviewedAt: null,
    createdAt: '2026-09-11T09:35:00',
    ...over,
  }) as VerificationRequest;

const hook = (over: object) => ({
  identityId: 'company-1',
  request: null,
  state: 'none',
  refetch: jest.fn(),
  invalidate: jest.fn().mockResolvedValue(undefined),
  ...over,
});

beforeEach(() => jest.clearAllMocks());

describe('format', () => {
  it('writes the send time and the file line as in the design', () => {
    expect(formatSubmittedAt('2026-09-11T09:35:00')).toBe(
      '11 سبتمبر 09:35 صباحا',
    );
    expect(
      formatFileMeta('2024-10-15T10:00:00', 204800, 'application/pdf'),
    ).toBe('15 Oct, 2024 • 200 KB • PDF');
  });

  it('reads the state from the badge and the latest request', () => {
    expect(verificationStateOf({ isVerified: false, request: null })).toBe(
      'none',
    );
    expect(
      verificationStateOf({ isVerified: false, request: request() }),
    ).toBe('pending');
    expect(
      verificationStateOf({
        isVerified: false,
        request: request({ status: 'CHANGES_REQUESTED' }),
      }),
    ).toBe('changes-requested');
    expect(
      verificationStateOf({
        isVerified: true,
        request: request({ status: 'APPROVED' }),
      }),
    ).toBe('verified');
  });
});

describe('the card button', () => {
  it.each([
    ['none', 'طلب توثيق'],
    ['pending', 'طلبك قيد المراجعة'],
    ['changes-requested', 'استكمال البيانات'],
    ['verified', 'حساب موثق'],
  ])('%s shows «%s»', async (state, label) => {
    mockUseVerification.mockReturnValue(hook({ state, request: request() }));
    const { getByTestId } = await render(<CompanyVerificationAction />);
    expect(getByTestId(`verification-button-${state}`)).toHaveTextContent(
      label,
    );
  });

  it('«طلب توثيق» opens the form', async () => {
    mockUseVerification.mockReturnValue(hook({ state: 'none' }));
    const { getByTestId } = await render(<CompanyVerificationAction />);
    await fireEvent.press(getByTestId('verification-button-none'));
    expect(present).toHaveBeenCalled();
  });

  it('«استكمال البيانات» opens the screen to fix the fields', async () => {
    mockUseVerification.mockReturnValue(
      hook({
        state: 'changes-requested',
        request: request({ status: 'CHANGES_REQUESTED' }),
      }),
    );
    const { getByTestId } = await render(<CompanyVerificationAction />);
    await fireEvent.press(getByTestId('verification-button-changes-requested'));
    expect(router.push).toHaveBeenCalledWith('/company-verification');
  });

  it('under review, the details show the licence that was sent', async () => {
    mockUseVerification.mockReturnValue(
      hook({ state: 'pending', request: request() }),
    );
    const { getByText } = await render(<CompanyVerificationAction />);
    expect(getByText('تفاصيل طلب التوثيق')).toBeTruthy();
    expect(getByText('98576389')).toBeTruthy();
    expect(getByText('19 مايو 2029')).toBeTruthy();
    expect(getByText('الاستشارات الهندسية والتصميم')).toBeTruthy();
    expect(getByText('11 Sep, 2026 • 200 KB • PDF')).toBeTruthy();
  });
});

describe('«تقديم طلب توثيق»', () => {
  it('needs the licence number and image, then sends them', async () => {
    const onSent = jest.fn();
    const { getByTestId } = await render(
      <SubmitVerificationSheet identityId="company-1" onSent={onSent} />,
    );

    await fireEvent.press(getByTestId('verification-submit'));
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'رقم الرخصة مطلوب');

    await fireEvent.changeText(
      getByTestId('verification-license-number'),
      '6743963845',
    );
    await fireEvent.press(getByTestId('verification-submit'));
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'صورة الرخصة مطلوبة');

    await fireEvent.press(getByTestId('verification-license-file'));
    await waitFor(() =>
      expect(getByTestId('verification-license-file')).toHaveTextContent(
        /license\.jpg/,
      ),
    );
    await fireEvent.press(getByTestId('verification-submit'));

    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(verificationService.submit).toHaveBeenCalledWith('company-1', {
      licenseNumber: '6743963845',
      licenseActivity: undefined,
      licenseExpiry: undefined,
      file: expect.objectContaining({ uri: 'file://license.jpg' }),
    });
  });
});

describe('«استكمال بيانات طلب التوثيق»', () => {
  const sentBack = request({
    status: 'CHANGES_REQUESTED',
    issues: {
      licenseNumber: 'غير مطابق لصورة الرخصة، يرجى ادخاله مرة اخرى.',
    },
  });

  it('asks only the fields sent back, and lists the rest as accepted', async () => {
    mockUseVerification.mockReturnValue(
      hook({ state: 'changes-requested', request: sentBack }),
    );
    const { getByText, queryByText, getByTestId } = await render(
      <CompleteVerificationScreen />,
    );

    expect(
      getByText(
        /رقم الرخصة الذي ادخلته “98576389” غير مطابق لصورة الرخصة/,
      ),
    ).toBeTruthy();
    expect(getByTestId('verification-new-license-number')).toBeTruthy();
    expect(queryByText('استبدال صورة الرخصة')).toBeNull();
    expect(
      getByText('صورة الرخصة، النشاط وتاريخ الانتهاء تم قبولها ولا تحتاج إلى تعديل.'),
    ).toBeTruthy();
  });

  it('sends back only the new licence number', async () => {
    mockUseVerification.mockReturnValue(
      hook({ state: 'changes-requested', request: sentBack }),
    );
    const { getByTestId } = await render(<CompleteVerificationScreen />);

    await fireEvent.press(getByTestId('verification-resubmit'));
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'يرجى ادخال رقم الرخصة');

    await fireEvent.changeText(
      getByTestId('verification-new-license-number'),
      '6743963845',
    );
    await fireEvent.press(getByTestId('verification-resubmit'));

    await waitFor(() =>
      expect(verificationService.resubmit).toHaveBeenCalledWith('company-1', {
        licenseNumber: '6743963845',
        licenseActivity: undefined,
        licenseExpiry: undefined,
        file: undefined,
      }),
    );
    expect(present).toHaveBeenCalled();
  });
});
