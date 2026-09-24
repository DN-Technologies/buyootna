import { fireEvent, render } from '@testing-library/react-native';

import { AlertItem } from '@/shared/api/alerts.service';

import AlertListItem from '../AlertListItem';

describe('AlertListItem', () => {
  const baseAuctionAlert: AlertItem = {
    id: 'auction-1',
    type: 'AUCTIONS',
    operationType: null,
    governorateId: 'capital',
    areaId: 'capital_1',
    categoryId: null,
    price: null,
    rentValue: null,
    areaSize: null,
    rooms: null,
    baths: null,
    floors: null,
    requestYear: null,
    requiredYear: null,
    amenities: [],
    startDate: '2026-10-01T00:00:00.000Z',
    endDate: '2026-10-15T00:00:00.000Z',
    createdAt: new Date().toISOString(),
  };

  const basePropertyAlert: AlertItem = {
    id: 'property-1',
    type: 'PROPERTIES',
    operationType: 'RENT',
    governorateId: 'hawally',
    areaId: 'hawally_1',
    categoryId: 'apartment',
    price: null,
    rentValue: 450,
    areaSize: 120,
    rooms: 3,
    baths: 2,
    floors: null,
    requestYear: null,
    requiredYear: null,
    amenities: ['garage'],
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
  };

  const baseExchangeAlert: AlertItem = {
    id: 'exchange-1',
    type: 'PROPERTIES',
    operationType: 'EXCHANGE',
    governorateId: 'capital',
    areaId: 'capital_1',
    categoryId: 'land',
    price: null,
    rentValue: null,
    areaSize: null,
    rooms: null,
    baths: null,
    floors: null,
    requestYear: 2023,
    requiredYear: 2021,
    amenities: [],
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
  };

  it('renders Auction alert correctly with emblem, title, subtitle, and date', async () => {
    const onDeletePress = jest.fn();
    const { getByText } = await render(
      <AlertListItem alert={baseAuctionAlert} onDeletePress={onDeletePress} />,
    );

    expect(getByText('مزادات وزارة العدل')).toBeTruthy();
    expect(getByText(/مزادات الأراضي السكنية/)).toBeTruthy();
    expect(getByText(/2026/)).toBeTruthy();
    expect(getByText('تم تفعيل التنبيهات')).toBeTruthy();
  });

  it('renders Property Rent alert with feature badges (chips) for price, rooms, baths, and amenities', async () => {
    const onDeletePress = jest.fn();
    const { getByText } = await render(
      <AlertListItem alert={basePropertyAlert} onDeletePress={onDeletePress} />,
    );

    expect(getByText(/شقة للإيجار/)).toBeTruthy();
    expect(getByText('حتى 450 د.ك')).toBeTruthy();
    expect(getByText('٣ غرف')).toBeTruthy();
    expect(getByText('٢ حمام')).toBeTruthy();
    expect(getByText('جراج')).toBeTruthy();
  });

  it('renders Property Exchange alert with request/required years chip', async () => {
    const onDeletePress = jest.fn();
    const { getByText } = await render(
      <AlertListItem alert={baseExchangeAlert} onDeletePress={onDeletePress} />,
    );

    expect(getByText(/أرض للبدل/)).toBeTruthy();
    expect(getByText('طلب 2023 مع 2021')).toBeTruthy();
  });

  it('renders paused status text when isActive is false', async () => {
    const onDeletePress = jest.fn();
    const { getByText, queryByText } = await render(
      <AlertListItem
        alert={basePropertyAlert}
        isActive={false}
        onDeletePress={onDeletePress}
      />,
    );

    expect(getByText('تم ايقاف التنبيهات')).toBeTruthy();
    expect(queryByText('تم تفعيل التنبيهات')).toBeNull();
  });

  it('handles toggle switch press to invoke onToggleActive', async () => {
    const onDeletePress = jest.fn();
    const onToggleActive = jest.fn();
    const { getByTestId } = await render(
      <AlertListItem
        alert={basePropertyAlert}
        isActive={true}
        onToggleActive={onToggleActive}
        onDeletePress={onDeletePress}
      />,
    );

    const toggle = getByTestId('alert-toggle-switch');
    fireEvent.press(toggle);

    expect(onToggleActive).toHaveBeenCalledWith('property-1', false);
  });

  it('triggers onDeletePress when delete button is pressed', async () => {
    const onDeletePress = jest.fn();
    const { getByTestId } = await render(
      <AlertListItem alert={basePropertyAlert} onDeletePress={onDeletePress} />,
    );

    const deleteBtn = getByTestId('alert-delete-btn');
    fireEvent.press(deleteBtn);

    expect(onDeletePress).toHaveBeenCalledWith('property-1');
  });
});
