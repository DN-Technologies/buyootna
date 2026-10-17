import { render } from '@testing-library/react-native';

import PropertyCard from '../PropertyCard';
import PropertyListItem from '../PropertyListItem';

const base = { area: 100, location: 'السالمية', category: 'شقة' };

describe('PropertyListItem price', () => {
  it('shows "السعر غير معلن" instead of a lone currency when there is no price', async () => {
    const { getByText, queryByText } = await render(
      <PropertyListItem {...base} price={0} />,
    );
    expect(getByText('السعر غير معلن')).toBeTruthy();
    expect(queryByText('د.ك')).toBeNull();
  });

  it('shows the price and currency when there is one', async () => {
    const { getByText, queryByText } = await render(
      <PropertyListItem {...base} price={5000} />,
    );
    expect(getByText('د.ك')).toBeTruthy();
    expect(queryByText('السعر غير معلن')).toBeNull();
  });
});

describe('exchange years on the cards', () => {
  const years = { requestYear: 2019, requiredYear: 2025 };

  it('list item: the years take the place of a missing price', async () => {
    const { getByText, queryByText } = await render(
      <PropertyListItem {...base} price={0} {...years} />,
    );
    expect(getByText('سنة الطلب')).toBeTruthy();
    expect(getByText('2019')).toBeTruthy();
    expect(getByText('السنة المطلوبة')).toBeTruthy();
    expect(getByText('2025')).toBeTruthy();
    expect(queryByText('السعر غير معلن')).toBeNull();
  });

  it('list item: a priced exchange shows both', async () => {
    const { getByText } = await render(
      <PropertyListItem {...base} price={80000} {...years} />,
    );
    expect(getByText('د.ك')).toBeTruthy();
    expect(getByText('سنة الطلب')).toBeTruthy();
  });

  it('image card: shows the years instead of «السعر غير معلن»', async () => {
    const { getByText, queryByText } = await render(
      <PropertyCard id="p1" images={[]} {...base} price={0} {...years} />,
    );
    expect(getByText('السنة المطلوبة')).toBeTruthy();
    expect(getByText('2025')).toBeTruthy();
    expect(queryByText('السعر غير معلن')).toBeNull();
  });

  it('shows nothing extra without the years', async () => {
    const { queryByTestId } = await render(
      <PropertyCard id="p1" images={[]} {...base} price={5000} />,
    );
    expect(queryByTestId('exchange-years')).toBeNull();
  });
});
