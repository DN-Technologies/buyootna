import { cleanup, fireEvent, render } from '@testing-library/react-native';

import CompanyProfileScreen from '@/app/company/[id]';
import { useCompanyDetails } from '@/shared/hooks/providers/useCompanyDetails';
import { useCompanyReport } from '@/shared/hooks/providers/useCompanyReport';
import { useCompanyReviews } from '@/shared/hooks/providers/useCompanyReviews';
import { useAuthStore } from '@/shared/store/useAuthStore';

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

// The reviews' «إبلاغ» sheet, like the screen's other sheets, isn't rendered
jest.mock('@/shared/hooks/useReviewReport', () => ({
  useReviewReport: () => ({ reportReview: jest.fn(), reportSheet: null }),
}));

// The sign-in sheet a guest gets: records being opened
const mockAuthPresent = jest.fn();
jest.mock('@/shared/components/auth/AuthGuardSheet', () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual('react');
  return forwardRef(function MockAuthGuardSheet(_p: unknown, ref: unknown) {
    useImperativeHandle(ref, () => ({ present: mockAuthPresent }));
    return null;
  });
});

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
// The highlights row has its own spec
jest.mock('@/features/stories/components/ProfileHighlights', () => ({
  __esModule: true,
  default: () => null,
}));
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

const mockUseCompanyReviews = useCompanyReviews as jest.Mock;
const mockUseCompanyReport = useCompanyReport as jest.Mock;

describe('CompanyProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoryRing = null;
    mockBlocked = false;

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

  // QA: a guest tapping «شارك برأيك» got no sign-in prompt
  describe('«شارك برأيك»', () => {
    beforeEach(() => {
      mockUseCompanyDetails.mockReturnValue({
        company: { id: 'comp-1', name: 'شركة البناء الحديث', userId: 'user-1' },
        isLoading: false,
        services: [],
        projects: [],
        targetUserId: 'user-1',
      });
    });
    afterEach(() => useAuthStore.setState({ token: null }));

    it('asks a guest to sign in', async () => {
      useAuthStore.setState({ token: null });
      const screen = await render(<CompanyProfileScreen />);
      fireEvent.press(screen.getByText('شارك برأيك'));
      expect(mockAuthPresent).toHaveBeenCalledTimes(1);
    });

    it('a signed-in user goes straight to the review', async () => {
      useAuthStore.setState({ token: 't' });
      const screen = await render(<CompanyProfileScreen />);
      fireEvent.press(screen.getByText('شارك برأيك'));
      expect(mockAuthPresent).not.toHaveBeenCalled();
    });
  });

  describe('blocking from the profile menu', () => {
    beforeEach(() => {
      useAuthStore.setState({ token: 't' });
      mockUseCompanyDetails.mockReturnValue({
        company: { id: 'comp-ident-1', name: 'شركة البناء الحديث', userId: 'user-1', services: [], projects: [] },
        isLoading: false,
        services: [],
        projects: [],
        targetUserId: 'user-1',
      });
    });

    afterEach(() => useAuthStore.setState({ token: null }));

    // QA: a guest got no sign-in prompt for حظر / إبلاغ
    it('asks a guest to sign in instead of blocking', async () => {
      useAuthStore.setState({ token: null });
      const screen = await render(<CompanyProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      alertButtons()
        .find((b) => b.text === 'حظر الشركة')
        ?.onPress?.();
      expect(mockAskToBlock).not.toHaveBeenCalled();
      expect(mockAuthPresent).toHaveBeenCalledTimes(1);
    });

    it('asks a guest to sign in instead of reporting', async () => {
      useAuthStore.setState({ token: null });
      const handleOpenReport = jest.fn();
      mockUseCompanyReport.mockReturnValue({
        reportSheetRef: { current: null },
        handleOpenReport,
        handleSubmitReport: jest.fn(),
      });
      const screen = await render(<CompanyProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      const report = alertButtons().find((b) => /إبلاغ/.test(b.text));
      expect(report).toBeTruthy();
      report?.onPress?.();
      expect(handleOpenReport).not.toHaveBeenCalled();
      expect(mockAuthPresent).toHaveBeenCalledTimes(1);
    });

    it('offers «حظر الشركة», which asks to block the account and its profile', async () => {
      const screen = await render(<CompanyProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      const block = alertButtons().find((b) => b.text === 'حظر الشركة');
      expect(block).toBeTruthy();
      block?.onPress?.();
      expect(mockAskToBlock).toHaveBeenCalledWith(
        { userId: 'user-1', identityId: 'comp-ident-1' },
        expect.any(String),
      );
    });

    it('once blocked, offers «إلغاء حظر الشركة» instead', async () => {
      mockBlocked = true;
      const screen = await render(<CompanyProfileScreen />);
      await fireEvent.press(screen.getByTestId('profile-options'));
      const texts = alertButtons().map((b) => b.text);
      expect(texts).toContain('إلغاء حظر الشركة');
      expect(texts).not.toContain('حظر الشركة');
      alertButtons()
        .find((b) => b.text === 'إلغاء حظر الشركة')
        ?.onPress?.();
      expect(mockAskToUnblock).toHaveBeenCalledWith('user-1', expect.any(String));
    });
  });
});
