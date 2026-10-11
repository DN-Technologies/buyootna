import { fireEvent, render } from '@testing-library/react-native';

import type { CompanyRequestItem } from '@/features/company/components/requests/types';

import MyRequestListItem from '../MyRequestListItem';
import OffersListHeader from '../OffersListHeader';
import { countByStatus, myRequestPills } from '../requestStatus';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (a: any) => mockPush(a) } }));

const make = (over: Partial<CompanyRequestItem> = {}): CompanyRequestItem => ({
  id: 'r1',
  clientIdentityId: 'c1',
  title: 'فحص هندسي لعقار بالسالمية',
  clientName: 'أنا',
  requestNumber: '#A1B2C3',
  location: 'السالمية',
  attachmentsCount: 0,
  description: 'x',
  status: 'pending',
  scope: 'public',
  createdAt: '2026-02-01T00:00:00.000Z',
  ...over,
});

const provider = {
  id: 'p1',
  name: 'شركة أركان',
  logoUrl: null,
  specialty: 'الاستشارات الهندسية',
  isVerified: true,
};

describe('requestStatus', () => {
  it('counts requests per status and labels the pills with them', async () => {
    const list = [
      make({ id: '1' }),
      make({ id: '2' }),
      make({ id: '3', status: 'accepted' }),
    ];
    expect(countByStatus(list)).toEqual({
      pending: 2,
      responded: 0,
      accepted: 1,
      rejected: 0,
    });
    expect(myRequestPills(list).map((p) => p.label)).toEqual([
      'قيد الانتظار (2)',
      'تم الرد (0)',
      'المقبولة (1)',
      'مرفوضة (0)',
    ]);
  });
});

describe('OffersListHeader', () => {
  const pills = myRequestPills([make()]);

  it('switches status from a pill', async () => {
    const onStatusChange = jest.fn();
    const { getByText } = await render(
      <OffersListHeader
        pills={pills}
        activeStatus="pending"
        onStatusChange={onStatusChange}
      />,
    );
    await fireEvent.press(getByText('تم الرد (0)'));
    expect(onStatusChange).toHaveBeenCalledWith('responded');
  });

  it('warns that rejected requests disappear after 30 days, only on that tab', async () => {
    const note = 'الطلبات المرفوضة تختفي بعد 30 يوم';
    const { queryByText, rerender } = await render(
      <OffersListHeader pills={pills} activeStatus="pending" onStatusChange={jest.fn()} />,
    );
    expect(queryByText(note)).toBeNull();
    await rerender(
      <OffersListHeader pills={pills} activeStatus="rejected" onStatusChange={jest.fn()} />,
    );
    expect(queryByText(note)).toBeTruthy();
  });
});

describe('MyRequestListItem', () => {
  it('shows the offers count for a request nobody has been picked for', async () => {
    const { getByTestId } = await render(
      <MyRequestListItem request={make({ offersCount: 3 })} />,
    );
    expect(getByTestId('my-request-subtitle-r1').props.children).toBe('3 عروض');
  });

  it('shows the company a directed request went to', async () => {
    const { getByTestId } = await render(
      <MyRequestListItem request={make({ status: 'responded', provider })} />,
    );
    expect(getByTestId('my-request-subtitle-r1').props.children).toBe('شركة أركان');
  });

  it('accepted: shows the executing company and opens a chat with it', async () => {
    const { getByText, getByTestId } = await render(
      <MyRequestListItem request={make({ status: 'accepted', provider })} />,
    );
    expect(getByText('الشركة المنفذة')).toBeTruthy();
    expect(getByText('شركة أركان')).toBeTruthy();

    await fireEvent.press(getByTestId('my-request-chat-r1'));
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/chat/[id]',
        params: expect.objectContaining({ id: 'new', recipientId: 'p1' }),
      }),
    );
  });

  it('opens the request details when a card is tapped', async () => {
    mockPush.mockClear();
    const { getByTestId } = await render(<MyRequestListItem request={make()} />);
    await fireEvent.press(getByTestId('my-request-card-r1'));
    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/request-details/[id]',
        params: { id: 'r1' },
      }),
    );
  });
});
