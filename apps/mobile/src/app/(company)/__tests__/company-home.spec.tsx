import { fireEvent, render } from '@testing-library/react-native';

import type { CompanyRequestItem } from '@/features/company/components/requests';
import { useCompanyHome } from '@/features/company/hooks/useCompanyHome';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';

import CompanyHomeScreen from '../home';

// The stories tray has its own tests; here it renders nothing
// The pill (logo, notch, chats and bell) has its own specs
jest.mock('@/shared/components/avatar-pill/AvatarPill', () => {
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <View testID="avatar-pill" /> };
});
jest.mock('@/features/auth/components/ProfileBottomSheet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/stories/components/StoryTray', () => ({
  __esModule: true,
  default: () => null,
}));

const mockPush = jest.fn();
const mockReply = jest.fn();
const mockLoadConversations = jest.fn();
let mockServices = [{ id: 's-1' }, { id: 's-2' }, { id: 's-3' }];

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/features/company/hooks/useCompanyHome', () => ({
  useCompanyHome: jest.fn(),
}));

jest.mock('@/features/company/hooks/useCompanyRequests', () => ({
  useCompanyRequests: jest.fn(),
}));

jest.mock('@/features/company/hooks/useOpenRequestChat', () => ({
  useOpenRequestChat: () => ({ openChat: mockReply, openingId: null }),
}));

jest.mock('@/features/company/hooks/useMyCompanyServices', () => ({
  useMyCompanyServices: () => ({ services: mockServices, refetch: jest.fn() }),
}));

jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    activeIdentity: { id: 'co-1', companyData: {} },
    displayName: 'دار العقار الحديث',
    avatarUrl: 'https://example.com/logo.png',
    isVerified: true,
  }),
}));

jest.mock(
  '@/shared/hooks/notifications/useUnreadNotificationsCount',
  () => ({ useUnreadNotificationsCount: () => 1 }),
);

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: () => ({ token: 'token', refreshProfile: jest.fn() }),
}));

jest.mock('@/shared/store/useChatStore', () => ({
  useChatStore: (selector: (state: unknown) => unknown) =>
    selector({
      conversations: [{ unreadCount: 2 }, { unreadCount: 3 }],
      loadConversations: mockLoadConversations,
    }),
}));

const request = (
  overrides: Partial<CompanyRequestItem>,
): CompanyRequestItem => ({
  id: 'req-1',
  clientIdentityId: 'client-1',
  title: 'تمديدات كهرباء لمحل تجاري',
  clientName: 'عبد الله القحطاني',
  location: 'السالمية',
  attachmentsCount: 3,
  description: 'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة.',
  status: 'pending',
  scope: 'company',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const PRIVATE = [
  request({ id: 'p-1', priceRange: '15,000 - 22,000 د.ك' }),
  request({ id: 'p-2', status: 'accepted', createdAt: '2020-01-01T00:00:00Z' }),
];
const PUBLIC = [request({ id: 'g-1', scope: 'public' })];

const BILLING = {
  hasActivePlan: true,
  activePlanName: 'ذهبي',
  adsRemaining: 3,
  hasOverdueInvoice: false,
};

const setup = async ({
  billing = BILLING as object | undefined,
  privateRequests = PRIVATE,
  publicRequests = PUBLIC,
  services = [{ id: 's-1' }, { id: 's-2' }, { id: 's-3' }],
} = {}) => {
  mockServices = services;
  (useCompanyHome as jest.Mock).mockReturnValue({
    data: billing ? { billing } : undefined,
    refetch: jest.fn(),
  });
  (useCompanyRequests as jest.Mock).mockImplementation((scope: string) => ({
    data: scope === 'company' ? privateRequests : publicRequests,
    refetch: jest.fn(),
  }));
  return render(<CompanyHomeScreen />);
};

describe('CompanyHomeScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the header, the four figures and both request lists', async () => {
    const { getByText, getByTestId, queryByText } = await setup();

    // The header is the home pill alone
    expect(queryByText('دار العقار الحديث')).toBeNull();
    expect(getByTestId('avatar-pill')).toBeTruthy();

    // One of the two private requests is from the last 7 days
    expect(getByTestId('stat-private-requests-value').props.children).toBe(
      '1 هذا الأسبوع',
    );
    expect(getByTestId('stat-active-services-value').props.children).toBe('3');
    expect(getByTestId('stat-new-messages-value').props.children).toBe('5');
    expect(getByTestId('stat-accepted-requests-value').props.children).toBe(
      '1',
    );

    expect(getByText('طلبات خاصة بالشركة')).toBeTruthy();
    expect(getByText('طلبات عامة')).toBeTruthy();
    // A subscribed company with services sees no card between them
    expect(queryByText('استعرض الباقات')).toBeNull();
    expect(queryByText('اضافة خدمة')).toBeNull();
    // The old extra sections are gone from the home
    expect(queryByText('الخدمات')).toBeNull();
  });

  it('tags each card: status and "الرد" for private, "مناسبة لك" and "ارسال عرض" for public', async () => {
    const { getByTestId, getByText } = await setup();

    expect(getByText('قيد الانتظار')).toBeTruthy();
    expect(getByText('مقبولة')).toBeTruthy();
    expect(getByText('مناسبة لك')).toBeTruthy();
    expect(getByText('15,000 - 22,000 د.ك')).toBeTruthy();

    await fireEvent.press(getByTestId('home-request-reply-p-1'));
    expect(mockReply).toHaveBeenCalledWith(PRIVATE[0]);

    expect(getByText('ارسال عرض')).toBeTruthy();
    await fireEvent.press(getByTestId('home-request-details-g-1'));
    expect(mockPush).toHaveBeenCalledWith('/(company)/(requests)/g-1');
  });

  it('hides "طلبات خاصة بالشركة" and shows 0 when nobody has written to the company', async () => {
    const { getByTestId, getByText, queryByText } = await setup({
      privateRequests: [],
    });

    expect(queryByText('طلبات خاصة بالشركة')).toBeNull();
    expect(getByText('طلبات عامة')).toBeTruthy();
    expect(getByTestId('stat-private-requests-value').props.children).toBe('0');
  });

  it('offers the plans when the company has no plan', async () => {
    const { getByTestId, getByText } = await setup({
      billing: { ...BILLING, hasActivePlan: false },
    });

    expect(getByTestId('home-banner-plans')).toBeTruthy();
    await fireEvent.press(getByText('استعرض الباقات'));
    expect(mockPush).toHaveBeenCalledWith('/company-plans');
  });

  it('offers "اضافة خدمة" to a subscribed company without services', async () => {
    const { getByTestId, getByText } = await setup({ services: [] });

    expect(getByTestId('home-banner-add-service')).toBeTruthy();
    await fireEvent.press(getByText('اضافة خدمة'));
    expect(mockPush).toHaveBeenCalledWith('/(company)/(more)/add-service');
  });

  it('shows the trial countdown when the API reports one', async () => {
    const { getByTestId, getByText } = await setup({
      billing: { ...BILLING, trialDaysLeft: 14 },
    });

    expect(getByTestId('home-banner-trial')).toBeTruthy();
    expect(
      getByText('يتبقى 14 يومًا للاستمتاع بجميع المميزات.'),
    ).toBeTruthy();
  });

  it('shows no card while the billing is still loading', async () => {
    const { queryByText } = await setup({ billing: undefined });

    expect(queryByText('استعرض الباقات')).toBeNull();
  });

  // Right after a profile switch (or sign-in) the queries are already
  // loading and the profile was just loaded: no second round of requests
  it('loads only the conversations on the first focus; coming back refreshes all', async () => {
    const { useFocusEffect } = require('@react-navigation/native');
    let focus: () => void = () => {};
    (useFocusEffect as jest.Mock).mockImplementation((cb: () => void) => {
      focus = cb;
    });
    const refetchDashboard = jest.fn();
    await setup();
    (useCompanyHome as jest.Mock).mockReturnValue({
      data: { billing: BILLING },
      refetch: refetchDashboard,
    });

    focus();
    expect(mockLoadConversations).toHaveBeenCalledTimes(1);
    expect(refetchDashboard).not.toHaveBeenCalled();

    focus();
    expect(mockLoadConversations).toHaveBeenCalledTimes(2);
    (useFocusEffect as jest.Mock).mockReset();
  });
});
