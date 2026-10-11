import { cleanup, fireEvent, render } from '@testing-library/react-native';

import OfficeProfileScreen from '@/app/office/[id]';
import { useOfficeDetails } from '@/shared/hooks/providers/useOfficeDetails';
import { useOfficeReport } from '@/shared/hooks/providers/useOfficeReport';
import { useOfficeReviews } from '@/shared/hooks/providers/useOfficeReviews';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({ id: 'off-1' })),
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
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
const mockUseOfficeReviews = useOfficeReviews as jest.Mock;
const mockUseOfficeReport = useOfficeReport as jest.Mock;

describe('OfficeProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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
    expect(getAllByText('الإعلانات').length).toBe(2);

    // Default tab is About - shows working hours and reviews
    expect(getByText('التقييمات')).toBeTruthy();

    // Switch to Services tab
    const servicesTab = getAllByText('الخدمات')[1];
    fireEvent.press(servicesTab);
    expect(await findByText('تسويق عقاري')).toBeTruthy();

    // Switch to Listings tab (index 1 is in the tab switcher)
    const listingsTab = getAllByText('الإعلانات')[1];
    fireEvent.press(listingsTab);
    expect(await findByText('150,000')).toBeTruthy();
  });
});
