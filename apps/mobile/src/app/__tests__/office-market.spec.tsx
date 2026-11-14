import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { feedService } from '@/features/individual/services/feed.service';
import { showAlert } from '@/shared/utils/alert';

import OfficeMarketScreen from '../office-market';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));
jest.mock('@/features/individual/services/feed.service', () => ({
  feedService: { getProperties: jest.fn() },
}));
jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({ favoritedIds: [], toggleFavorite: jest.fn() }),
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (sel: (s: object) => unknown) =>
    sel({ activeIdentity: { id: 'office-me', type: 'OFFICE' } }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/shared/utils/presentSheet', () => ({ presentSheet: jest.fn() }));
// The sheets' own content is tested elsewhere
jest.mock('@/features/individual/components/home/filter/HomeFilterSheet', () => {
  const { forwardRef } = jest.requireActual('react');
  return forwardRef(() => null);
});
jest.mock('@/shared/components/profile/RadioSelectionSheet', () => {
  const { forwardRef } = jest.requireActual('react');
  return forwardRef(() => null);
});
// المحافظة / المنطقة: each option pressable by its label
jest.mock('@/shared/components/feedback/SelectionBottomSheet', () => {
  const { forwardRef } = jest.requireActual('react');
  const { Text, TouchableOpacity, View } = jest.requireActual('react-native');
  return forwardRef(
    (
      props: { title: string; options: string[]; onSelect: (o: string) => void },
      _ref: unknown,
    ) => (
      <View>
        {props.options.map((option: string) => (
          <TouchableOpacity
            key={option}
            testID={`option-${props.title}-${option}`}
            onPress={() => props.onSelect(option)}
          >
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  );
});

const getProperties = feedService.getProperties as jest.Mock;
const page = (data: object[]) => ({
  data,
  meta: { total: data.length, current: 1, limit: 10, totalPages: 1, hasNextPage: false },
});
const ad = (id: string, over: object = {}) => ({
  id,
  images: [],
  price: 100000,
  isFeatured: false,
  categoryLabel: 'شقة',
  area: 120,
  location: 'حولي',
  type: 'سكني',
  identityId: 'someone',
  ...over,
});

async function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <OfficeMarketScreen />
    </QueryClientProvider>,
  );
}

describe('عقارات السوق (office)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getProperties.mockResolvedValue(page([ad('a1'), ad('mine', { identityId: 'office-me' })]));
  });

  it("lists بيع first, without the office's own ads", async () => {
    const { findByTestId, queryByTestId, getByText } = await renderScreen();

    expect(await findByTestId('office-market-card-a1')).toBeTruthy();
    expect(queryByTestId('office-market-card-mine')).toBeNull();
    expect(getByText('عقارات السوق')).toBeTruthy();
    expect(getProperties).toHaveBeenCalledWith('SALE', 1, 10, 'DEFAULT', undefined);
  });

  it('ايجار and بدل load their own ads', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await findByTestId('office-market-card-a1');

    await fireEvent.press(getByTestId('office-market-tabs-rent'));
    await waitFor(() =>
      expect(getProperties).toHaveBeenCalledWith('RENT', 1, 10, 'DEFAULT', undefined),
    );
    await fireEvent.press(getByTestId('office-market-tabs-exchange'));
    await waitFor(() =>
      expect(getProperties).toHaveBeenCalledWith('EXCHANGE', 1, 10, 'DEFAULT', undefined),
    );
  });

  it('المحافظة then المنطقة filter the list', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await findByTestId('office-market-card-a1');
    // المنطقة waits for a governorate
    expect(getByTestId('office-market-area').props.accessibilityState).toEqual({
      disabled: true,
    });

    await fireEvent.press(getByTestId('option-المحافظة-العاصمة'));
    await waitFor(() =>
      expect(getProperties).toHaveBeenCalledWith('SALE', 1, 10, 'DEFAULT', {
        governorateId: 'capital',
      }),
    );
    expect(getByTestId('office-market-governorate')).toHaveTextContent('العاصمة');

    await fireEvent.press(getByTestId('option-المنطقة-مدينة جابر الأحمد'));
    await waitFor(() =>
      expect(getProperties).toHaveBeenCalledWith('SALE', 1, 10, 'DEFAULT', {
        governorateId: 'capital',
        areaId: 'capital_1',
      }),
    );
  });

  it('«عرض تفاصيل» opens the ad; «اقتراح لعميل» says it is coming', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await findByTestId('office-market-card-a1');

    await fireEvent.press(getByTestId('office-market-details-a1'));
    expect(mockPush).toHaveBeenCalledWith('/property/a1');

    await fireEvent.press(getByTestId('office-market-suggest-a1'));
    expect(showAlert).toHaveBeenCalledWith('قريباً', expect.any(String));
  });

  it('the header goes back', async () => {
    const { findByTestId, getByTestId } = await renderScreen();
    await findByTestId('office-market-card-a1');

    await fireEvent.press(getByTestId('office-market-back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('with photos: the photo cards instead', async () => {
    const { findByTestId, getByTestId, queryByTestId } = await renderScreen();
    await findByTestId('office-market-card-a1');

    await fireEvent.press(getByTestId('office-market-view-card'));
    expect(queryByTestId('office-market-card-a1')).toBeNull();
  });

  it('nothing found says so', async () => {
    getProperties.mockResolvedValue(page([]));
    const { findByTestId } = await renderScreen();
    expect(await findByTestId('office-market-empty')).toHaveTextContent(
      'لا توجد عقارات مطابقة',
    );
  });
});
