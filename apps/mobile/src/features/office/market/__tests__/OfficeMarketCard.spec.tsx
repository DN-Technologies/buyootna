import { fireEvent, render } from '@testing-library/react-native';

import type { PropertyDto } from '@/types/feed';

import OfficeMarketCard from '../OfficeMarketCard';

const base = {
  id: 'p1',
  images: [],
  price: 150000,
  isFeatured: true,
  categoryLabel: 'عمارة',
  area: 200,
  location: 'شمال غرب صليبيخات',
  type: 'سكني',
  propertyIncome: 12000,
} as unknown as PropertyDto;

const handlers = () => ({
  onPress: jest.fn(),
  onFavorite: jest.fn(),
  onShare: jest.fn(),
  onSuggest: jest.fn(),
});

// Figma 4494:147645 / 147837 / 147888 (عقارات السوق for an office)
describe('OfficeMarketCard', () => {
  it('a sale ad: price, «مميز», category, place, size and «مدخول العقار»', async () => {
    const { getByText, getByTestId } = await render(
      <OfficeMarketCard property={base} isFavorited={false} {...handlers()} />,
    );

    expect(getByText('150,000', { exact: false })).toBeTruthy();
    expect(getByTestId('office-market-featured-p1')).toBeTruthy();
    expect(getByText('عمارة')).toBeTruthy();
    expect(getByText('شمال غرب صليبيخات')).toBeTruthy();
    expect(getByText('200 م2')).toBeTruthy();
    expect(getByTestId('office-market-income-p1')).toHaveTextContent(
      'مدخول العقار12,000د.ك',
    );
  });

  it('no price: «السعر غير معلن»; not featured: no badge', async () => {
    const { getByText, queryByTestId } = await render(
      <OfficeMarketCard
        property={{ ...base, price: null, isFeatured: false } as never}
        isFavorited={false}
        {...handlers()}
      />,
    );

    expect(getByText('السعر غير معلن')).toBeTruthy();
    expect(queryByTestId('office-market-featured-p1')).toBeNull();
  });

  it('an exchange ad shows «طلب 2021 مع 2023», and no income', async () => {
    const { getByTestId, queryByTestId } = await render(
      <OfficeMarketCard
        property={
          {
            ...base,
            propertyIncome: null,
            categoryLabel: 'أرض',
            requestYear: 2021,
            requiredYear: 2023,
          } as never
        }
        isFavorited={false}
        {...handlers()}
      />,
    );

    expect(getByTestId('office-market-years-p1')).toHaveTextContent(
      'طلب 2021مع2023',
    );
    expect(queryByTestId('office-market-income-p1')).toBeNull();
  });

  it('its buttons: details, «اقتراح لعميل», share and the heart', async () => {
    const h = handlers();
    const { getByTestId } = await render(
      <OfficeMarketCard property={base} isFavorited {...h} />,
    );

    await fireEvent.press(getByTestId('office-market-details-p1'));
    await fireEvent.press(getByTestId('office-market-suggest-p1'));
    await fireEvent.press(getByTestId('office-market-share-p1'));
    await fireEvent.press(getByTestId('office-market-favorite-p1'));

    expect(h.onPress).toHaveBeenCalledTimes(1);
    expect(h.onSuggest).toHaveBeenCalledTimes(1);
    expect(h.onShare).toHaveBeenCalledTimes(1);
    expect(h.onFavorite).toHaveBeenCalledTimes(1);
    expect(
      getByTestId('office-market-favorite-p1').props.accessibilityState,
    ).toEqual({ selected: true });
  });
});
