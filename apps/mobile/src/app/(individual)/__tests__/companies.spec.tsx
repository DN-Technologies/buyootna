import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { feedService } from '@/features/individual/services/feed.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import CompaniesScreen from '../companies';

// The shared mock leaves out sheet footers; the filter sheet's buttons live
// in one, so this one renders it under the sheet's content
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mock = jest.requireActual('../../../../__mocks__/@gorhom/bottom-sheet');
  const BottomSheetModal = React.forwardRef(
    ({ footerComponent, children, ...props }: any, ref: any) => (
      <mock.BottomSheetModal {...props} ref={ref}>
        <View>
          {children}
          {footerComponent?.({})}
        </View>
      </mock.BottomSheetModal>
    ),
  );
  BottomSheetModal.displayName = 'BottomSheetModal';
  return { __esModule: true, ...mock, default: BottomSheetModal, BottomSheetModal };
});
jest.mock('@shopify/flash-list');

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({
  useScrollToTop: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@/features/individual/services/feed.service', () => ({
  feedService: { getCompanies: jest.fn() },
}));

jest.mock('@/shared/hooks/providers/useProviderFavorites', () => ({
  useProviderFavorites: () => ({
    isFavorited: () => false,
    toggleFavorite: jest.fn(),
  }),
}));

const mockGuardAction = jest.fn();
jest.mock('@/shared/hooks/auth/useAuthGuard', () => ({
  useAuthGuard: () => ({
    guardAction: mockGuardAction,
    authSheetRef: { current: null },
  }),
}));

// Heavy sheets aren't under test here
// Records what the list opens the quote sheet with
let mockQuoteProps: Record<string, unknown> = {};
jest.mock('@/shared/components/company/QuoteRequestModal', () => {
  const React = jest.requireActual('react');
  return React.forwardRef((props: Record<string, unknown>, _ref: unknown) => {
    mockQuoteProps = props;
    return null;
  });
});
jest.mock('@/shared/hooks/providers/useCompanyDetails', () => ({
  useCompanyDetails: (id?: string) => ({
    company: id ? { id, logoUrl: 'https://cdn/logo.png' } : undefined,
    services: id ? [{ id: 'svc-1', title: 'مخططات تنفيذية' }] : [],
    isLoading: false,
  }),
}));
jest.mock('@/shared/components/auth/AuthGuardSheet', () => () => null);

async function renderScreen() {
  return await render(
    <QueryClientProvider client={new QueryClient()}>
      <CompaniesScreen />
    </QueryClientProvider>,
  );
}

describe('CompaniesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (feedService.getCompanies as jest.Mock).mockResolvedValue({
      data: [],
      meta: { hasNextPage: false, current: 1 },
    });
  });

  it("disables طلب عرض سعر and chat on the account's own company only", async () => {
    useAuthStore.setState({ user: { id: 'me' } as never });
    (feedService.getCompanies as jest.Mock).mockResolvedValue({
      data: [
      {
        id: 'c-own',
        userId: 'me',
        name: 'البنيان',
        category: '',
        rating: 0,
        reviewsCount: 0,
        projectsCount: '0',
        lastActivityAt: new Date().toISOString(),
        logoUrl: '',
      },
      {
        id: 'c-other',
        userId: 'someone',
        name: 'الرائد للهندسة',
        category: '',
        rating: 0,
        reviewsCount: 0,
        projectsCount: '0',
        lastActivityAt: new Date().toISOString(),
        logoUrl: '',
      },
      ],
      meta: { hasNextPage: false, current: 1 },
    });
    const { findByText, getAllByTestId } = await renderScreen();
    await findByText('البنيان');

    const [ownQuote, otherQuote] = getAllByTestId('company-quote');
    const [ownChat, otherChat] = getAllByTestId('company-chat');
    expect(ownQuote).toBeDisabled();
    expect(ownChat).toBeDisabled();
    expect(otherQuote).not.toBeDisabled();
    expect(otherChat).not.toBeDisabled();
    // «شركتك» says why: on the account's own company only
    expect(getAllByTestId('company-own-tag')).toHaveLength(1);

    useAuthStore.setState({ user: null });
  });

  // QA: a company whose account also had an individual persona opened a
  // chat with that individual: the card sent the account id, which the API
  // reads as the account's default (individual) persona
  it("chats with the company's persona, not its account", async () => {
    mockGuardAction.mockImplementation((action: () => void) => action());
    (feedService.getCompanies as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'company-persona',
          userId: 'owner-account',
          name: 'الرائد للهندسة',
          category: '',
          rating: 0,
          reviewsCount: 0,
          projectsCount: '0',
          lastActivityAt: new Date().toISOString(),
          logoUrl: '',
        },
      ],
      meta: { hasNextPage: false, current: 1 },
    });
    const { findByText, getByTestId } = await renderScreen();
    await findByText('الرائد للهندسة');

    await fireEvent.press(getByTestId('company-chat'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/chat/[id]',
      params: { id: 'new', recipientId: 'company-persona' },
    });
  });

  // QA: from the list the sheet offered a made-up list of services and sent
  // the request to nobody (a public request)
  it("asks the tapped company, offering its own services", async () => {
    (feedService.getCompanies as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'c-other',
          userId: 'someone',
          name: 'الرائد للهندسة',
          category: '',
          rating: 0,
          reviewsCount: 0,
          projectsCount: '0',
          lastActivityAt: new Date().toISOString(),
          logoUrl: '',
        },
      ],
      meta: { hasNextPage: false, current: 1 },
    });
    const { findByText, getByTestId } = await renderScreen();
    await findByText('الرائد للهندسة');

    await fireEvent.press(getByTestId('company-quote'));

    expect(mockQuoteProps).toMatchObject({
      companyName: 'الرائد للهندسة',
      targetIdentityId: 'c-other',
      services: [{ id: 'svc-1', title: 'مخططات تنفيذية' }],
      catalogFallback: true,
    });
  });

  // QA: the keyboard closed after every letter because the list header was
  // a new component type on each render, remounting the search input
  it('keeps the same search input mounted while typing', async () => {
    const { getByPlaceholderText } = await render(
      <QueryClientProvider client={new QueryClient()}>
        <CompaniesScreen />
      </QueryClientProvider>,
    );

    const input = getByPlaceholderText('ابحث باسم الشركة...');
    await fireEvent.changeText(input, 'ب');
    const afterFirst = getByPlaceholderText('ابحث باسم الشركة...');
    await fireEvent.changeText(afterFirst, 'با');

    expect(getByPlaceholderText('ابحث باسم الشركة...')).toBe(input);
    expect(input.props.value).toBe('با');
  });

  // QA: the filter icon pushed the property /search screen with its
  // sale/rent filter instead of the company filter
  it('the filter icon opens the company تصفية البحث sheet, not /search', async () => {
    const { present } = require('@gorhom/bottom-sheet');
    const { getByLabelText } = await renderScreen();

    await fireEvent.press(getByLabelText('تصفية البحث'));

    expect(present).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('picking a الترتيب حسب option refetches companies with that sort', async () => {
    const { getByLabelText, findByText } = await renderScreen();

    await fireEvent.press(getByLabelText('الترتيب حسب'));
    await fireEvent.press(await findByText('الأعلى تقييماً'));

    await waitFor(() =>
      expect(feedService.getCompanies).toHaveBeenLastCalledWith(
        undefined,
        1,
        10,
        undefined,
        'RATING_DESC',
        { specialty: undefined, location: undefined },
      ),
    );
  });

  // Figma "services filters": التخصص, نوع الخدمة, المحافظة, المنطقة
  describe('تصفية البحث', () => {
    it('shows the four fields, with عرض النتائج off until something changes', async () => {
      const { getByText, getByTestId } = await renderScreen();

      expect(getByText('اختر التخصص أو المجال')).toBeTruthy();
      // نوع الخدمة waits for a specialty: its types come from it
      expect(getByText('اختر التخصص أولاً')).toBeTruthy();
      expect(getByText('اختر المحافظة')).toBeTruthy();
      expect(getByText('اختر المنطقة')).toBeTruthy();
      expect(getByTestId('company-filter-apply').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });

    it('applies التخصص, نوع الخدمة and the governorate to the request', async () => {
      const { getByText, getByTestId, getAllByText, queryByTestId } =
        await renderScreen();

      expect(queryByTestId('companies-filter-active-dot')).toBeNull();

      await fireEvent.press(getByText('اختر التخصص أو المجال'));
      await fireEvent.press(getAllByText('التشطيب').at(-1)!);
      // التشطيب's own service types (the services catalogue)
      await fireEvent.press(getByText('اختر نوع الخدمة التي تبحث عنها'));
      await fireEvent.press(getAllByText('تشطيب شقة').at(-1)!);
      await fireEvent.press(getByText('اختر المحافظة'));
      await fireEvent.press(getAllByText('حولي').at(-1)!);

      await fireEvent.press(getByTestId('company-filter-apply'));

      await waitFor(() =>
        expect(feedService.getCompanies).toHaveBeenLastCalledWith(
          'تشطيب شقة',
          1,
          10,
          undefined,
          'NEWEST',
          { specialty: 'التشطيب', location: 'حولي' },
        ),
      );
      expect(getByTestId('companies-filter-active-dot')).toBeTruthy();
    });

    it('clears the picks with إعادة التعيين', async () => {
      const { getByText, getByTestId, getAllByText } = await renderScreen();

      await fireEvent.press(getByText('اختر التخصص أو المجال'));
      await fireEvent.press(getAllByText('التشطيب').at(-1)!);
      await fireEvent.press(getByTestId('company-filter-reset'));

      expect(getByText('اختر التخصص أو المجال')).toBeTruthy();
      expect(getByTestId('company-filter-apply').props.accessibilityState).toMatchObject({
        disabled: true,
      });
    });
  });
});
