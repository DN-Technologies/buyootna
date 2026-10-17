import { fireEvent, render } from '@testing-library/react-native';

import OfficeGovernorateScreen from '@/app/office/governorate';
import { useOfficeDetails } from '@/shared/hooks/providers/useOfficeDetails';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({
    officeId: 'off-1',
    governorateId: 'capital',
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({ favoritedIds: [], toggleFavorite: jest.fn() }),
}));

jest.mock('@/shared/hooks/providers/useOfficeDetails', () => ({
  useOfficeDetails: jest.fn(),
}));

const ad = (id: string, listingType: string, extra = {}) => ({
  id,
  images: [],
  price: 150000,
  companyName: 'مكتب',
  isFeatured: false,
  type: 'سكني',
  categoryLabel: 'عمارة',
  area: 200,
  beds: 0,
  baths: 0,
  location: 'شمال غرب صليبيخات',
  createdAt: '2026-10-01T00:00:00.000Z',
  governorateId: 'capital',
  listingType,
  ...extra,
});

describe('OfficeGovernorateScreen', () => {
  beforeEach(() => {
    (useOfficeDetails as jest.Mock).mockReturnValue({
      isLoading: false,
      properties: [
        ad('s1', 'SALE'),
        ad('s2', 'SALE'),
        ad('x1', 'EXCHANGE', { requestYear: 2021, requiredYear: 2023 }),
        ad('h1', 'SALE', { governorateId: 'hawally' }),
      ],
    });
  });

  it('shows the governorate and its sale ads first', async () => {
    const { getByText, getByTestId } = await render(<OfficeGovernorateScreen />);

    expect(getByText('محافظة العاصمة')).toBeTruthy();
    expect(getByTestId('office-governorate-count').props.children).toEqual([2, ' عقارات']);
  });

  it('switches to بدل and shows the two years', async () => {
    const { getByTestId, getByText } = await render(<OfficeGovernorateScreen />);

    await fireEvent.press(getByTestId('office-deal-EXCHANGE'));

    expect(getByTestId('office-governorate-count').props.children).toEqual([1, ' عقارات']);
    expect(getByText('طلب 2021')).toBeTruthy();
  });
});
