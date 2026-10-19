/* eslint-disable @typescript-eslint/no-require-imports */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor, within } from '@testing-library/react-native';

import { CompanyRequestItem } from '@/features/company/components/requests';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';
import { companyRequestsService } from '@/shared/api/companyRequests.service';

import CompanyRequestsScreen from '../company-requests';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));

jest.mock('@/features/company/hooks/useCompanyRequests', () => ({
  useCompanyRequests: jest.fn(),
}));

// The shared mock leaves out footerComponent; the filter sheet's
// عرض النتائج / إعادة التعيين live there
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mock = jest.requireActual('../../../../__mocks__/@gorhom/bottom-sheet');
  const BottomSheetModal = React.forwardRef(
    ({ footerComponent, children, ...props }: any, ref: any) => (
      <mock.BottomSheetModal {...props} ref={ref}>
        <View>
          {children}
          {footerComponent?.({})}
        </View>
      </mock.BottomSheetModal>
    ),
  );
  BottomSheetModal.displayName = 'BottomSheetModal';
  return { __esModule: true, ...mock, default: BottomSheetModal, BottomSheetModal };
});

jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: { respond: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockUseCompanyRequests = useCompanyRequests as jest.Mock;

const ALL_REQUESTS: CompanyRequestItem[] = [
  {
    id: 'req-1',
    clientIdentityId: 'client-1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    location: 'السالمية',
    attachmentsCount: 3,
    description: 'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة.',
    status: 'pending',
    scope: 'company',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'req-2',
    clientIdentityId: 'client-1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    location: 'السالمية',
    attachmentsCount: 3,
    description: 'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة.',
    status: 'responded',
    scope: 'company',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'req-3',
    clientIdentityId: 'client-1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    location: 'السالمية',
    attachmentsCount: 3,
    description: 'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة.',
    status: 'accepted',
    scope: 'company',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'req-pub-1',
    clientIdentityId: 'client-2',
    title: 'صيانة تكييف مركزي لمكتب',
    clientName: 'سارة المطيري',
    location: 'الجهراء',
    attachmentsCount: 2,
    description: 'مكتب إداري بمساحة 200م، يحتاج صيانة شاملة لنظام التكييف.',
    status: 'pending',
    scope: 'public',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function mockRequestsFor(scope: 'company' | 'public', status: string) {
  mockUseCompanyRequests.mockReturnValue({
    data: ALL_REQUESTS.filter(
      (r) => r.scope === scope && (status === 'all' || r.status === status),
    ),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
}

function Screen() {
  const [client] = require('react').useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <CompanyRequestsScreen />
    </QueryClientProvider>
  );
}
const renderScreen = () => render(<Screen />);

describe('CompanyRequestsScreen (real data)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestsFor('company', 'all');
  });

  it('renders header with title "الطلبات", search input, and filter button', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = await renderScreen();

    expect(getByTestId('company-requests-title')).toBeTruthy();
    expect(getByText('الطلبات')).toBeTruthy();
    expect(getByPlaceholderText('ابحث عن طلب عرض سعر...')).toBeTruthy();
    expect(getByTestId('company-requests-filter-button')).toBeTruthy();
  });

  it('renders scope segmented tabs: "خاصة بالشركة" and "عامة"', async () => {
    const { getByTestId } = await renderScreen();

    const companyTab = getByTestId('company-requests-tab-company');
    const publicTab = getByTestId('company-requests-tab-public');

    expect(within(companyTab).getByText('خاصة بالشركة')).toBeTruthy();
    expect(within(publicTab).getByText('عامة')).toBeTruthy();
  });

  it('renders the chips: "الكل", "قيد الانتظار", "مقبولة", "تم الرد", "مرفوضة", "المفضلة"', async () => {
    const { getByTestId } = await renderScreen();

    const allPill = getByTestId('company-requests-filter-all');
    const pendingPill = getByTestId('company-requests-filter-pending');
    const acceptedPill = getByTestId('company-requests-filter-accepted');
    const respondedPill = getByTestId('company-requests-filter-responded');

    expect(within(allPill).getByText('الكل')).toBeTruthy();
    expect(within(pendingPill).getByText('قيد الانتظار')).toBeTruthy();
    expect(within(acceptedPill).getByText('مقبولة')).toBeTruthy();
    expect(within(respondedPill).getByText('تم الرد')).toBeTruthy();
    expect(
      within(getByTestId('company-requests-filter-rejected')).getByText('مرفوضة'),
    ).toBeTruthy();
    expect(
      within(getByTestId('company-requests-filter-saved')).getByText('المفضلة'),
    ).toBeTruthy();
  });

  it('re-queries the hook with the "public" scope when switching tabs', async () => {
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('company-requests-tab-public'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'public',
      'all',
      '',
      {},
    );
  });

  it('re-queries the hook with the selected status filter', async () => {
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('company-requests-filter-pending'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'company',
      'pending',
      '',
      {},
    );
  });

  it('renders requests returned by the hook and an empty state when there are none', async () => {
    const { getByTestId, getByText, rerender } = await renderScreen();

    expect(getByTestId('company-request-card-req-1')).toBeTruthy();
    expect(getByTestId('company-request-card-req-2')).toBeTruthy();
    expect(getByTestId('company-request-card-req-3')).toBeTruthy();

    mockUseCompanyRequests.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    await rerender(<Screen />);

    expect(getByText('لا توجد طلبات مطابقة')).toBeTruthy();
  });

  it('"الرد" opens the reply sheet; it sends once a field has text', async () => {
    (companyRequestsService.respond as jest.Mock).mockResolvedValue({});
    const { present } = require('@gorhom/bottom-sheet');

    const { getByTestId, getByText } = await renderScreen();
    await fireEvent.press(getByTestId('company-request-reply-btn-req-1'));

    expect(present).toHaveBeenCalled();
    expect(getByTestId('request-reply-title')).toHaveTextContent(
      'تمديدات كهرباء لمحل تجاري',
    );
    expect(getByText('الرد على العميل')).toBeTruthy();

    const send = getByTestId('request-reply-send');
    expect(send).toBeDisabled();

    // Notes alone are enough
    await fireEvent.changeText(getByTestId('request-reply-notes'), '  يشمل المواد ');
    expect(send).not.toBeDisabled();
    await fireEvent.press(send);

    await waitFor(() =>
      expect(companyRequestsService.respond).toHaveBeenCalledWith('req-1', {
        notes: 'يشمل المواد',
      }),
    );
    expect(getByText('تم إرسال ردك بنجاح!')).toBeTruthy();
  });

  it('the reply sends the message and the notes together', async () => {
    (companyRequestsService.respond as jest.Mock).mockResolvedValue({});
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('company-request-reply-btn-req-1'));
    await fireEvent.changeText(getByTestId('request-reply-message'), 'مرحبا');
    await fireEvent.changeText(getByTestId('request-reply-notes'), 'خلال يومين');
    await fireEvent.press(getByTestId('request-reply-send'));

    await waitFor(() =>
      expect(companyRequestsService.respond).toHaveBeenCalledWith('req-1', {
        message: 'مرحبا',
        notes: 'خلال يومين',
      }),
    );
  });

  it('navigates to the details screen on "التفاصيل" press', async () => {
    const { getByTestId } = await renderScreen();

    const detailsBtn = getByTestId('company-request-details-btn-req-1');
    await fireEvent.press(detailsBtn);
    expect(mockPush).toHaveBeenCalledWith('/(company)/(requests)/req-1');
  });

  it('المفضلة re-queries the hook with the saved tab', async () => {
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('company-requests-filter-saved'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'company',
      'saved',
      '',
      {},
    );
  });

  it('تصفية البحث: نوع الخدمة waits for التخصص; عرض النتائج applies the price', async () => {
    const { getByTestId, getByText, queryByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('company-requests-filter-button'));
    expect(getByText('تصفية البحث')).toBeTruthy();
    expect(getByText('اختر التخصص أولاً')).toBeTruthy();

    // Nothing changed yet: عرض النتائج stays off
    expect(getByTestId('request-filter-apply')).toBeDisabled();

    await fireEvent.changeText(getByTestId('request-filter-priceFrom'), '1000');
    await fireEvent.changeText(getByTestId('request-filter-priceTo'), '٥٠٠٠');
    await fireEvent.press(getByTestId('request-filter-apply'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'company',
      'all',
      '',
      { priceFrom: 1000, priceTo: 5000 },
    );
    expect(queryByTestId('company-requests-filter-active-dot')).toBeTruthy();
  });

  it('إعادة التعيين clears the filters', async () => {
    const { getByTestId, queryByTestId } = await renderScreen();

    await fireEvent.changeText(getByTestId('request-filter-priceFrom'), '1000');
    await fireEvent.press(getByTestId('request-filter-apply'));
    await fireEvent.press(getByTestId('request-filter-reset'));
    await fireEvent.press(getByTestId('request-filter-apply'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'company',
      'all',
      '',
      {},
    );
    expect(queryByTestId('company-requests-filter-active-dot')).toBeNull();
  });
});
