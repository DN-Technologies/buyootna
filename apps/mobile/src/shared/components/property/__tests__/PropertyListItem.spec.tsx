import { render } from '@testing-library/react-native';

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
