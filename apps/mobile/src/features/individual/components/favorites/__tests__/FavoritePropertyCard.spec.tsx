import { render, screen } from '@testing-library/react-native';

import FavoritePropertyCard from '../FavoritePropertyCard';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

const setup = (over: object = {}) =>
  render(
    <FavoritePropertyCard
      id="p1"
      price={705000}
      categoryLabel="عمارة"
      location="شقة فاخرة تشطيب سوبر ديلوكس - مجموعة الأوراق العقارية المتحدة"
      area={140}
      {...over}
    />,
  );

describe('FavoritePropertyCard', () => {
  // QA (iOS): a long place ran out of the card and took the size with it
  it('cuts a long place with … and keeps the type and size inside the card', async () => {
    await setup();

    const place = screen.getByText(/شقة فاخرة/);
    expect(place.props.numberOfLines).toBe(1);
    expect(String(place.props.className)).toContain('shrink');
    const placeBox = String(screen.getByTestId('favorite-card-location').props.className);
    expect(placeBox).toContain('flex-1');
    expect(placeBox).toContain('min-w-0');
    expect(String(screen.getByTestId('favorite-card-area').props.className)).toContain(
      'shrink-0',
    );
    expect(screen.getByText('140 م2')).toBeTruthy();
  });

  it('shows the price with its currency', async () => {
    await setup();
    expect(screen.getByTestId('favorite-card-price').props.children).toBe('705,000');
    expect(screen.getByText('د.ك')).toBeTruthy();
  });

  // QA screenshot: an exchange ad showed a lone "د.ك"
  it('says للبدل for an exchange ad, with no currency', async () => {
    await setup({ price: 0, listingType: 'EXCHANGE' });
    expect(screen.getByTestId('favorite-card-price').props.children).toBe('للبدل');
    expect(screen.queryByText('د.ك')).toBeNull();
  });

  it('says the price is not set when another ad has none', async () => {
    await setup({ price: '', listingType: 'SALE' });
    expect(screen.getByTestId('favorite-card-price').props.children).toBe('السعر غير محدد');
    expect(screen.queryByText('د.ك')).toBeNull();
  });
});
