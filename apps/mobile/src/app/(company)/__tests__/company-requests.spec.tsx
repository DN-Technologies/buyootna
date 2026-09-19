import { fireEvent, render, within } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CompanyRequestsScreen from '../company-requests';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.spyOn(Alert, 'alert');

describe('CompanyRequestsScreen (Figma Design Implementation 4410:164470)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('switches between "خاصة بالشركة" and "عامة" scopes', async () => {
    const { getByTestId, queryByText, getAllByText } = await render(
      <CompanyRequestsScreen />,
    );

    // Initial default is 'company' scope -> includes 'عبد الله القحطاني'
    expect(getAllByText('عبد الله القحطاني').length).toBeGreaterThan(0);
    expect(queryByText('سارة المطيري')).toBeNull();

    // Switch to public requests
    await fireEvent.press(getByTestId('company-requests-tab-public'));

    // Public scope requests should now be visible
    expect(queryByText('سارة المطيري')).toBeTruthy();
    expect(queryByText('صيانة تكييف مركزي لمكتب')).toBeTruthy();
    expect(queryByText('عبد الله القحطاني')).toBeNull();
  });

  it('filters requests by status pill', async () => {
    const { getByTestId, queryByTestId } = await render(
      <CompanyRequestsScreen />,
    );

    // In 'company' scope with 'all': req-1 (pending), req-2 (responded), req-3 (accepted), req-4 (accepted)
    expect(getByTestId('company-request-card-req-1')).toBeTruthy();
    expect(getByTestId('company-request-card-req-2')).toBeTruthy();
    expect(getByTestId('company-request-card-req-3')).toBeTruthy();

    // Select 'pending'
    await fireEvent.press(getByTestId('company-requests-filter-pending'));
    expect(getByTestId('company-request-card-req-1')).toBeTruthy();
    expect(queryByTestId('company-request-card-req-2')).toBeNull();
    expect(queryByTestId('company-request-card-req-3')).toBeNull();

    // Select 'responded'
    await fireEvent.press(getByTestId('company-requests-filter-responded'));
    expect(queryByTestId('company-request-card-req-1')).toBeNull();
    expect(getByTestId('company-request-card-req-2')).toBeTruthy();

    // Reset to 'all'
    await fireEvent.press(getByTestId('company-requests-filter-all'));
    expect(getByTestId('company-request-card-req-1')).toBeTruthy();
    expect(getByTestId('company-request-card-req-2')).toBeTruthy();
  });

  it('filters requests by search input text', async () => {
    const { getByPlaceholderText, queryByTestId, getByText } = await render(
      <CompanyRequestsScreen />,
    );

    const searchInput = getByPlaceholderText('ابحث عن طلب عرض سعر...');

    // Type nonexistent query
    await fireEvent.changeText(searchInput, 'كلمة غير موجودة');

    // Empty state should be visible
    expect(getByText('لا توجد طلبات مطابقة')).toBeTruthy();
    expect(queryByTestId('company-request-card-req-1')).toBeNull();

    // Clear search
    await fireEvent.changeText(searchInput, '');
    expect(queryByTestId('company-request-card-req-1')).toBeTruthy();
  });

  it('triggers alert on "الرد" and "التفاصيل" button presses', async () => {
    const { getByTestId } = await render(<CompanyRequestsScreen />);

    // Press reply on first card
    const replyBtn = getByTestId('company-request-reply-btn-req-1');
    await fireEvent.press(replyBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      'الرد على الطلب',
      expect.stringContaining('تقديم عرض سعر لطلب:'),
    );

    // Press details on first card -> navigates to details screen
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
