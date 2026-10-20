import { cleanup, fireEvent, render } from '@testing-library/react-native';

import CompanyProfileScreen from '@/app/company/[id]';
import { useCompanyDetails } from '@/shared/hooks/providers/useCompanyDetails';
import { useCompanyReport } from '@/shared/hooks/providers/useCompanyReport';
import { useCompanyReviews } from '@/shared/hooks/providers/useCompanyReviews';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({ id: 'comp-1' })),
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModal: 'BottomSheetModal',
}));

jest.mock('@/shared/components/company/CompanyModals', () => {
  return function MockCompanyModals() {
    return null;
  };
});

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/hooks/providers/useCompanyDetails', () => ({
  useCompanyDetails: jest.fn(),
}));

jest.mock('@/shared/hooks/providers/useCompanyReviews', () => ({
  useCompanyReviews: jest.fn(),
}));

jest.mock('@/shared/hooks/providers/useCompanyReport', () => ({
  useCompanyReport: jest.fn(),
}));

const mockUseCompanyDetails = useCompanyDetails as jest.Mock;
// The story ring has its own spec (useProviderStoryRing)
let mockStoryRing: { hasUnseen: boolean; onPress: jest.Mock } | null = null;
const mockStoryRingFor = jest.fn();
jest.mock('@/features/stories/hooks/useProviderStoryRing', () => ({
  useProviderStoryRing: (id: string | undefined) => {
    mockStoryRingFor(id);
    return mockStoryRing;
  },
}));

const mockUseCompanyReviews = useCompanyReviews as jest.Mock;
const mockUseCompanyReport = useCompanyReport as jest.Mock;

describe('CompanyProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoryRing = null;

    mockUseCompanyReport.mockReturnValue({
      reportSheetRef: { current: null },
      handleOpenReport: jest.fn(),
      handleSubmitReport: jest.fn(),
    });

    mockUseCompanyReviews.mockReturnValue({
      reviewSummary: {
        averageRating: 4.8,
        totalRatingsCount: 12,
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

  it('renders loading skeleton when company details are loading', async () => {
    mockUseCompanyDetails.mockReturnValue({
      company: null,
      isLoading: true,
      services: [],
      projects: [],
      targetUserId: '',
    });

    const { queryByText } = await render(<CompanyProfileScreen />);
    expect(queryByText('لم يتم العثور على الشركة')).toBeNull();
  });

  it('renders not found state when company is null and not loading', async () => {
    mockUseCompanyDetails.mockReturnValue({
      company: null,
      isLoading: false,
      services: [],
      projects: [],
      targetUserId: '',
    });

    const { getByText } = await render(<CompanyProfileScreen />);
    expect(getByText('لم يتم العثور على الشركة')).toBeTruthy();
  });

  it('renders company details and allows switching between tabs', async () => {
    const mockCompany = {
      id: 'comp-1',
      name: 'شركة البناء الحديث',
      bio: 'أفضل خدمات المقاولات',
      logoUrl: 'https://example.com/logo.png',
      rating: 4.8,
      reviewsCount: 15,
      servicesCount: 1,
      projectsCount: 1,
      services: [{ id: 's-1', title: 'تشطيبات وديكور' }],
      projects: [{ id: 'p-1', title: 'فيلا الرياض', images: [] }],
      userId: 'user-1',
    };

    mockUseCompanyDetails.mockReturnValue({
      company: mockCompany,
      isLoading: false,
      services: mockCompany.services,
      projects: mockCompany.projects,
      targetUserId: 'user-1',
    });

    const { getByText, getAllByText, findByText } = await render(
      <CompanyProfileScreen />,
    );

    expect(getByText('شركة البناء الحديث')).toBeTruthy();
    expect(getByText('عن الشركة')).toBeTruthy();
    expect(getAllByText('الخدمات').length).toBe(2);
    expect(getByText('المعرض')).toBeTruthy();

    // Default tab is About - shows working hours or reviews
    expect(getByText('التقييمات')).toBeTruthy();

    // Switch to Services tab (index 1 is the tab switcher button)
    const servicesTab = getAllByText('الخدمات')[1];
    fireEvent.press(servicesTab);
    expect(await findByText('تشطيبات وديكور')).toBeTruthy();

    // Switch to Gallery tab
    fireEvent.press(getByText('المعرض'));
    expect(await findByText('فيلا الرياض')).toBeTruthy();
  });

  describe('story ring on the logo', () => {
    beforeEach(() => {
      mockUseCompanyDetails.mockReturnValue({
        company: { id: 'comp-ident-1', name: 'شركة البناء الحديث', userId: 'user-1', services: [], projects: [] },
        isLoading: false,
        services: [],
        projects: [],
        targetUserId: 'user-1',
      });
    });

    it('asks for the profile\'s stories by its identity id', async () => {
      await render(<CompanyProfileScreen />);
      expect(mockStoryRingFor).toHaveBeenLastCalledWith('comp-ident-1');
    });

    it('without stories the logo is a plain, inert badge', async () => {
      const screen = await render(<CompanyProfileScreen />);
      const logo = screen.getByTestId('profile-logo');
      expect(logo.props.accessibilityState).toMatchObject({ disabled: true, selected: false });
    });

    it('with unseen stories it has a gold ring and opens them', async () => {
      mockStoryRing = { hasUnseen: true, onPress: jest.fn() };
      const screen = await render(<CompanyProfileScreen />);
      const logo = screen.getByTestId('profile-logo');
      expect(logo.props.accessibilityState).toMatchObject({ disabled: false, selected: true });
      await fireEvent.press(logo);
      expect(mockStoryRing.onPress).toHaveBeenCalled();
    });

    it('once all are seen the ring is grey', async () => {
      mockStoryRing = { hasUnseen: false, onPress: jest.fn() };
      const screen = await render(<CompanyProfileScreen />);
      expect(screen.getByTestId('profile-logo').props.accessibilityState).toMatchObject({
        disabled: false,
        selected: false,
      });
    });
  });
});
