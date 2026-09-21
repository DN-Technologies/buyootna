import { fireEvent, render, within } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { CompanyRequestItem } from '@/features/company/components/requests';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';
import { chatService } from '@/shared/api/chat.service';
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

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { createConversation: jest.fn() },
}));

jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: { markResponded: jest.fn() },
}));

jest.spyOn(Alert, 'alert');

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

describe('CompanyRequestsScreen (real data)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestsFor('company', 'all');
  });

  it('renders header with title "الطلبات", search input, and filter button', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = await render(
      <CompanyRequestsScreen />,
    );

    expect(getByTestId('company-requests-title')).toBeTruthy();
    expect(getByText('الطلبات')).toBeTruthy();
    expect(getByPlaceholderText('ابحث عن طلب عرض سعر...')).toBeTruthy();
    expect(getByTestId('company-requests-filter-button')).toBeTruthy();
  });

  it('renders scope segmented tabs: "خاصة بالشركة" and "عامة"', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    const companyTab = getByTestId('company-requests-tab-company');
    const publicTab = getByTestId('company-requests-tab-public');

    expect(within(companyTab).getByText('خاصة بالشركة')).toBeTruthy();
    expect(within(publicTab).getByText('عامة')).toBeTruthy();
  });

  it('renders filter status pills: "الكل", "قيد الانتظار", "مقبولة", "تم الرد"', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    const allPill = getByTestId('company-requests-filter-all');
    const pendingPill = getByTestId('company-requests-filter-pending');
    const acceptedPill = getByTestId('company-requests-filter-accepted');
    const respondedPill = getByTestId('company-requests-filter-responded');

    expect(within(allPill).getByText('الكل')).toBeTruthy();
    expect(within(pendingPill).getByText('قيد الانتظار')).toBeTruthy();
    expect(within(acceptedPill).getByText('مقبولة')).toBeTruthy();
    expect(within(respondedPill).getByText('تم الرد')).toBeTruthy();
  });

  it('re-queries the hook with the "public" scope when switching tabs', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    await fireEvent.press(getByTestId('company-requests-tab-public'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'public',
      'all',
      '',
    );
  });

  it('re-queries the hook with the selected status filter', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    await fireEvent.press(getByTestId('company-requests-filter-pending'));

    expect(mockUseCompanyRequests).toHaveBeenLastCalledWith(
      'company',
      'pending',
      '',
    );
  });

  it('renders requests returned by the hook and an empty state when there are none', async () => {
    const { getByTestId, getByText, rerender } = await render(
      <CompanyRequestsScreen />,
    );

    expect(getByTestId('company-request-card-req-1')).toBeTruthy();
    expect(getByTestId('company-request-card-req-2')).toBeTruthy();
    expect(getByTestId('company-request-card-req-3')).toBeTruthy();

    mockUseCompanyRequests.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    await rerender(<CompanyRequestsScreen />);

    expect(getByText('لا توجد طلبات مطابقة')).toBeTruthy();
  });

  it('starts a chat and marks the request responded on "الرد" press', async () => {
    (chatService.createConversation as jest.Mock).mockResolvedValue({ id: 'conv-1' });
    (companyRequestsService.markResponded as jest.Mock).mockResolvedValue({});

    const { getByTestId } = await render(<CompanyRequestsScreen />);

    const replyBtn = getByTestId('company-request-reply-btn-req-1');
    await fireEvent.press(replyBtn);

    expect(chatService.createConversation).toHaveBeenCalledWith('client-1');
    expect(companyRequestsService.markResponded).toHaveBeenCalledWith('req-1');
    expect(mockPush).toHaveBeenCalledWith('/chat/conv-1');
  });

  it('navigates to the details screen on "التفاصيل" press', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    const detailsBtn = getByTestId('company-request-details-btn-req-1');
    await fireEvent.press(detailsBtn);
    expect(mockPush).toHaveBeenCalledWith('/(company)/(requests)/req-1');
  });

  it('triggers alert on filter button press', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    const filterBtn = getByTestId('company-requests-filter-button');
    await fireEvent.press(filterBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      'تصفية متقدمة',
      'خيارات تصفية إضافية حسب الموقع ونطاق السعر',
    );
  });
});
