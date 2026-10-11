import { fireEvent, render } from '@testing-library/react-native';

import OfficeListingsTab from '@/shared/components/office/OfficeListingsTab';
import ProfileListingsTab from '@/shared/components/profile/ProfileListingsTab';
import type { PropertyDto } from '@/types/feed';

const mockToggleFavorite = jest.fn();
jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({
    favoritedIds: ['p2'],
    toggleFavorite: mockToggleFavorite,
  }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListHeaderComponent }: any) => (
      <View>
        {ListHeaderComponent?.()}
        {data.map((item: any, index: number) => (
          <View key={item.id}>{renderItem({ item, index })}</View>
        ))}
      </View>
    ),
  };
});

// The real cards: only the heart wiring matters here
jest.mock('@/shared/components/property/PropertyCard', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({ id, isFavorited, onFavorite }: any) => (
      <TouchableOpacity testID={`heart-${id}`} onPress={onFavorite}>
        <Text>{isFavorited ? 'filled' : 'outline'}</Text>
      </TouchableOpacity>
    ),
  };
});
jest.mock('@/shared/components/property/PropertyListItem', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({ id, isFavorited, onFavorite }: any) => (
      <TouchableOpacity testID={`heart-${id}`} onPress={onFavorite}>
        <Text>{isFavorited ? 'filled' : 'outline'}</Text>
      </TouchableOpacity>
    ),
  };
});

const properties = [{ id: 'p1' }, { id: 'p2' }] as unknown as PropertyDto[];

// QA: the heart on an advertiser's ads did nothing -- no feedback, no request
describe('hearts on an advertiser\'s ads', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['card', 'list'] as const)(
    'profile listings (%s view): shows the saved state and toggles it',
    async (viewMode) => {
      const { getByTestId, getAllByText } = await render(
        <ProfileListingsTab
          properties={properties}
          viewMode={viewMode}
          renderHeader={() => <></>}
        />,
      );

      expect(getAllByText('filled')).toHaveLength(1); // p2 is saved
      await fireEvent.press(getByTestId('heart-p1'));
      expect(mockToggleFavorite).toHaveBeenCalledWith('p1');
    },
  );

  it('office listings: shows the saved state and toggles it', async () => {
    const { getByTestId, getAllByText } = await render(
      <OfficeListingsTab properties={properties} />,
    );

    expect(getAllByText('filled')).toHaveLength(1);
    await fireEvent.press(getByTestId('heart-p2'));
    expect(mockToggleFavorite).toHaveBeenCalledWith('p2');
  });
});
