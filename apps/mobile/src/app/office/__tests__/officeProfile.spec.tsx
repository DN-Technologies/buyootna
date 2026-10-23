import { cleanup, fireEvent, render } from '@testing-library/react-native';

import OfficeProfileScreen from '@/app/office/[id]';
import { useOfficeDetails } from '@/shared/hooks/providers/useOfficeDetails';
import { useOfficeReport } from '@/shared/hooks/providers/useOfficeReport';
import { useOfficeReviews } from '@/shared/hooks/providers/useOfficeReviews';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: mockPush,
  })),
  useLocalSearchParams: jest.fn(() => ({ id: 'off-1' })),
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
}));

// The reviews' «إبلاغ» sheet, like the screen's other sheets, isn't rendered
jest.mock('@/shared/hooks/useReviewReport', () => ({
  useReviewReport: () => ({ reportReview: jest.fn(), reportSheet: null }),
}));

jest.mock('@/shared/components/office/OfficeModals', () => {
  return function MockOfficeModals() {
    return null;
  };
});

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// The listing cards read favourites; no server in this spec
jest.mock('@/shared/hooks/properties/useFavorites', () => ({
  useFavorites: () => ({ favoritedIds: [], toggleFavorite: jest.fn() }),
}));

jest.mock('@/shared/hooks/providers/useOfficeDetails', () => ({
  useOfficeDetails: jest.fn(),
}));

jest.mock('@/shared/hooks/providers/useOfficeReviews', () => ({
  useOfficeReviews: jest.fn(),
}));

jest.mock('@/shared/hooks/providers/useOfficeReport', () => ({
  useOfficeReport: jest.fn(),
}));

const mockUseOfficeDetails = useOfficeDetails as jest.Mock;
// The story ring has its own spec (useProviderStoryRing)
// Blocking has its own spec (useBlocks); here, what the menu offers
const mockAskToBlock = jest.fn();
const mockAskToUnblock = jest.fn();
let mockBlocked: boolean | null = false;
jest.mock('@/shared/hooks/blocks/useBlocks', () => ({
  useBlockStatus: () => mockBlocked,
  useBlockFlow: () => ({
    askToBlock: mockAskToBlock,
    askToUnblock: mockAskToUnblock,
  }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
type AlertButton = { text: string; onPress?: () => void };
const alertButtons = (): AlertButton[] => {
  const { showAlert } = jest.requireMock<{ showAlert: jest.Mock }>(
    '@/shared/utils/alert',
  );
  const calls = showAlert.mock.calls;
  return calls[calls.length - 1][2] as AlertButton[];
};
let mockStoryRing: { hasUnseen: boolean; onPress: jest.Mock } | null = null;
const mockStoryRingFor = jest.fn();
jest.mock('@/features/stories/hooks/useProviderStoryRing', () => ({
  useProviderStoryRing: (id: string | undefined) => {
    mockStoryRingFor(id);
    return mockStoryRing;
  },
}));

const mockUseOfficeReviews = useOfficeReviews as jest.Mock;
const mockUseOfficeReport = useOfficeReport as jest.Mock;

describe('OfficeProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoryRing = null;
    mockBlocked = false;

    mockUseOfficeReport.mockReturnValue({
      reportSheetRef: { current: null },
      handleOpenReport: jest.fn(),
      handleSubmitReport: jest.fn(),
    });

    mockUseOfficeReviews.mockReturnValue({
      reviewSummary: {
        averageRating: 4.7,
        totalRatingsCount: 10,
        ratingBreakdown: [],
      },
      reviews: [],
      displayedReviews: [],
      visibleReviewsCount: 3,
      reviewSort: 'all',
      setReviewSort: jest.fn(),
      handleShowMoreReviews: jest.fn(),
      handleAddReview: jest.fn(),
      handleToggleLike: jest.fn(),
      handleToggleDislike: jest.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders loading skeleton when office details are loading', async () => {
    mockUseOfficeDetails.mockReturnValue({
      office: null,
      isLoading: true,
      services: [],
      properties: [],
      workingHours: undefined,
      targetUserId: '',
    });

    const { queryByText } = await render(<OfficeProfileScreen />);
    expect(queryByText('لم يتم العثور على المكتب')).toBeNull();
  });

  it('renders not found state when office is null and not loading', async () => {
    mockUseOfficeDetails.mockReturnValue({
      office: null,
      isLoading: false,
      isError: false,
      services: [],
      properties: [],
      workingHours: undefined,
      targetUserId: '',
    });

    const { getByText } = await render(<OfficeProfileScreen />);
    expect(getByText('لم يتم العثور على المكتب')).toBeTruthy();
  });

  it('renders error state when isError is true', async () => {
    mockUseOfficeDetails.mockReturnValue({
      office: null,
      isLoading: false,
      isError: true,
      services: [],
      properties: [],
      workingHours: undefined,
      targetUserId: '',
    });

    const { getByText } = await render(<OfficeProfileScreen />);
    expect(getByText('تعذر تحميل بيانات المكتب')).toBeTruthy();
  });

  it('renders office details and allows switching between tabs', async () => {
    const mockOffice = {
      id: 'off-1',
      name: 'مكتب الرواد العقاري',
      bio: 'خدمات عقارية متكاملة',
      logoUrl: 'https://example.com/logo.png',
      rating: 4.7,
      reviewsCount: 10,
      servicesCount: 1,
      listingsCount: 1,
      licenseNumber: 'LIC-9988',
      services: [{ id: 's-1', title: 'تسويق عقاري' }],
      properties: [
        {
          id: 'p-1',
          title: 'فيلا فاخرة للبيع',
          price: 150000,
          currency: 'KWD',
          images: [],
        },
      ],
      workingHours: [{ day: 'الأحد', hours: '9am - 5pm' }],
      userId: 'user-off-1',
    };

    mockUseOfficeDetails.mockReturnValue({
      office: mockOffice,
      isLoading: false,
      isError: false,
      services: mockOffice.services,
      properties: mockOffice.properties,
      workingHours: mockOffice.workingHours,
      targetUserId: 'user-off-1',
    });

    const { getByText, getAllByText, findByText } = await render(
      <OfficeProfileScreen />,
    );

    expect(getByText('مكتب الرواد العقاري')).toBeTruthy();
    expect(getByText('عن المكتب')).toBeTruthy();
    expect(getAllByText('الخدمات').length).toBe(2);
    expect(getAllByText('الاعلانات').length).toBe(2);

    // Default tab is About - shows working hours and reviews
    expect(getByText('التقييمات')).toBeTruthy();

    // Switch to Services tab
    const servicesTab = getAllByText('الخدمات')[1];
    fireEvent.press(servicesTab);
    expect(await findByText('تسويق عقاري')).toBeTruthy();

    // Switch to Listings tab (index 1 is in the tab switcher)
    const listingsTab = getAllByText('الاعلانات')[1];
    fireEvent.press(listingsTab);
    expect(await findByText('150,000')).toBeTruthy();
  });

  describe('Figma office profile', () => {
    const office = (overrides: Record<string, unknown> = {}) => ({
      id: 'off-1',
      name: 'مكتب الرواد العقاري',
      rating: 4.7,
      reviewsCount: 10,
      servicesCount: 1,
      listingsCount: 3,
      licenseNumber: 'LIC-9988',
      services: [{ id: 's-1', title: 'البحث عن عقار للايجار', description: 'وصف' }],
      properties: [],
      userId: 'user-off-1',
      ...overrides,
    });
    const mockOffice = (data: ReturnType<typeof office>) =>
      mockUseOfficeDetails.mockReturnValue({
        office: data,
        isLoading: false,
        isError: false,
        services: data.services,
        properties: data.properties,
        workingHours: [],
        targetUserId: 'user-off-1',
      });

    it('shows اتصال beside ابدأ المحادثة when the office has a number', async () => {
      mockOffice(office({ phone: '99990000' }));
      const { getByTestId } = await render(<OfficeProfileScreen />);

      expect(getByTestId('office-start-chat')).toBeTruthy();
      expect(getByTestId('office-call')).toBeTruthy();
    });

    // Figma note: no number (or a hidden one) leaves only the chat button
    it('shows only ابدأ المحادثة without a number', async () => {
      mockOffice(office({ phone: null }));
      const { getByTestId, queryByTestId, queryByText } = await render(
        <OfficeProfileScreen />,
      );

      expect(getByTestId('office-start-chat')).toBeTruthy();
      expect(queryByTestId('office-call')).toBeNull();
      expect(queryByText('طلب عرض سعر')).toBeNull();
    });

    it('lists the ads as one card per governorate that opens its ads', async () => {
      mockPush.mockClear();
      const ad = (id: string, governorateId: string, categoryLabel: string) => ({
        id,
        images: [],
        price: 1000,
        companyName: 'مكتب',
        isFeatured: false,
        type: 'سكني',
        categoryLabel,
        area: 300,
        beds: 3,
        baths: 2,
        location: 'x',
        createdAt: '2026-10-01T00:00:00.000Z',
        listingType: 'SALE',
        governorateId,
      });
      mockOffice(
        office({
          properties: [
            ad('p1', 'hawally', 'شقة'),
            ad('p2', 'capital', 'بيت'),
            ad('p3', 'capital', 'أرض'),
          ],
        }),
      );
      const { getAllByText, getByTestId, getByText } = await render(
        <OfficeProfileScreen />,
      );

      await fireEvent.press(getAllByText('الاعلانات')[1]);

      expect(getByText('محافظة العاصمة')).toBeTruthy();
      expect(getByText('محافظة حولي')).toBeTruthy();
      expect(getByText('2 عقارات')).toBeTruthy();

      await fireEvent.press(getByTestId('office-governorate-capital'));
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/office/governorate',
        params: { officeId: 'off-1', governorateId: 'capital' },
      });
    });

    it('puts the round icon on each service card', async () => {
      mockOffice(office());
      const { getAllByText, getByTestId } = await render(<OfficeProfileScreen />);

      await fireEvent.press(getAllByText('الخدمات')[1]);

      expect(getByTestId('office-service-s-1')).toBeTruthy();
    });
  });

  describe('story ring on the logo', () => {
    beforeEach(() => {
      mockUseOfficeDetails.mockReturnValue({
        office: { id: 'off-ident-1', name: 'مكتب الرواد العقاري', userId: 'user-off-1', services: [], properties: [] },
        isLoading: false,
        isError: false,
        services: [],
        properties: [],
        workingHours: [],
        targetUserId: 'user-off-1',
      });
    });

    it('asks for the profile\'s stories by its identity id', async () => {
      await render(<OfficeProfileScreen />);
      expect(mockStoryRingFor).toHaveBeenLastCalledWith('off-ident-1');
    });

    it('without stories the logo is a plain, inert badge', async () => {
      const screen = await render(<OfficeProfileScreen />);
      const logo = screen.getByTestId('profile-logo');
      expect(logo.props.accessibilityState).toMatchObject({ disabled: true, selected: false });
    });

    it('with unseen stories it has a gold ring and opens them', async () => {
      mockStoryRing = { hasUnseen: true, onPress: jest.fn() };
      const screen = await render(<OfficeProfileScreen />);
      const logo = screen.getByTestId('profile-logo');
      expect(logo.props.accessibilityState).toMatchObject({ disabled: false, selected: true });
      await fireEvent.press(logo);
      expect(mockStoryRing.onPress).toHaveBeenCalled();
    });

    it('once all are seen the ring is grey', async () => {
      mockStoryRing = { hasUnseen: false, onPress: jest.fn() };
      const screen = await render(<OfficeProfileScreen />);
      expect(screen.getByTestId('profile-logo').props.accessibilityState).toMatchObject({
        disabled: false,
        selected: false,
      });
    });
  });

  describe('blocking from the profile menu', () => {
    beforeEach(() => {
      mockUseOfficeDetails.mockReturnValue({
        office: { id: 'off-ident-1', name: 'مكتب الرواد العقاري', userId: 'user-off-1', services: [], properties: [] },
        isLoading: false,
        isError: false,
        services: [],
        properties: [],
        workingHours: [],
        targetUserId: 'user-off-1',
      });
    });

    it('offers «حظر المكتب», which asks to block the account and its profile', async () => {
      const screen = await render(<OfficeProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      const block = alertButtons().find((b) => b.text === 'حظر المكتب');
      expect(block).toBeTruthy();
      block?.onPress?.();
      expect(mockAskToBlock).toHaveBeenCalledWith(
        { userId: 'user-off-1', identityId: 'off-ident-1' },
        expect.any(String),
      );
    });

    it('once blocked, offers «إلغاء حظر المكتب» instead', async () => {
      mockBlocked = true;
      const screen = await render(<OfficeProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      const texts = alertButtons().map((b) => b.text);
      expect(texts).toContain('إلغاء حظر المكتب');
      expect(texts).not.toContain('حظر المكتب');
      alertButtons()
        .find((b) => b.text === 'إلغاء حظر المكتب')
        ?.onPress?.();
      expect(mockAskToUnblock).toHaveBeenCalledWith('user-off-1', expect.any(String));
    });
  });
});
