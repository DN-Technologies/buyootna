// An office's own «الباقات» (Figma 10180:31480)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor, within } from '@testing-library/react-native';

import { plansService } from '@/shared/api/plans.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import PlansScreen from '../plans';

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));
jest.mock('expo-linking', () => ({ createURL: (p: string) => `buyootna://${p}` }));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(),
}));
jest.mock('@/shared/api/plans.service', () => ({
  plansService: { getPromo: jest.fn(), getPlans: jest.fn(), getWallet: jest.fn() },
}));

const OFFICE_PLANS = [
  {
    id: 'p-basic',
    slug: 'office-basic',
    name: 'الاساسية',
    price: 2,
    features: ['مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة شهرين.'],
    packages: [
      { id: 'pkg-reg', adsCount: 1, featuredAdsCount: 0, validityMonths: 2, price: 2 },
      { id: 'pkg-feat', adsCount: 0, featuredAdsCount: 1, validityMonths: 2, price: 3 },
    ],
  },
  {
    id: 'p-regular',
    slug: 'office-regular',
    name: 'العادية',
    price: 35,
    features: ['17 اعلان عادي.', '3 اعلانات مميزة.', 'مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة شهرين.'],
    packages: [{ id: 'pkg-17', adsCount: 17, featuredAdsCount: 3, validityMonths: 2, price: 35 }],
  },
  {
    id: 'p-silver',
    slug: 'office-silver',
    name: 'الفضية',
    price: 70,
    features: ['44 اعلان عادي.', '6 اعلانات مميزة.', 'مدة الاعلان 30 يوم.', 'صلاحية انتهاء الباقة 6 شهور.'],
    packages: [{ id: 'pkg-44', adsCount: 44, featuredAdsCount: 6, validityMonths: 6, price: 70 }],
  },
];

const renderScreen = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PlansScreen />
    </QueryClientProvider>,
  );

describe('PlansScreen for an office', () => {
  const before = useAuthStore.getState().activeIdentity;
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ activeIdentity: { id: 'o-1', type: 'OFFICE' } as never });
    (plansService.getPlans as jest.Mock).mockResolvedValue(OFFICE_PLANS);
    (plansService.getPromo as jest.Mock).mockResolvedValue(null);
    (plansService.getWallet as jest.Mock).mockResolvedValue({ freeAdsRemaining: 0, slots: [] });
  });
  afterAll(() => useAuthStore.setState({ activeIdentity: before }));

  it("shows the office's own plans: الاساسية's two choices and the two bundles", async () => {
    const screen = await renderScreen();

    await waitFor(() => expect(screen.getByTestId('office-plan-office-basic')).toBeTruthy());
    expect(plansService.getPlans).toHaveBeenCalledWith('OFFICE');

    const basic = within(screen.getByTestId('office-plan-office-basic'));
    expect(basic.getByText('الباقة الاساسية')).toBeTruthy();
    expect(basic.getByText('1 اعلان عادي')).toBeTruthy();
    expect(basic.getByText('1 اعلان مميز')).toBeTruthy();
    expect(basic.getByText('2 د.ك')).toBeTruthy();
    expect(basic.getByText('3 د.ك')).toBeTruthy();

    const regular = within(screen.getByTestId('office-plan-office-regular'));
    expect(regular.getByText('العادية')).toBeTruthy();
    expect(regular.getByText('35 دينار كويتي')).toBeTruthy();
    expect(regular.getByText('3 اعلانات مميزة.')).toBeTruthy();
    expect(within(screen.getByTestId('office-plan-office-silver')).getByText('70 دينار كويتي')).toBeTruthy();

    // Not the individuals' cards
    expect(screen.queryByText('الباقة الذهبية')).toBeNull();
  });

  it('buys the picked package by id: the featured single ad', async () => {
    const screen = await renderScreen();
    await waitFor(() => expect(screen.getByTestId('office-plan-office-basic')).toBeTruthy());
    const basic = within(screen.getByTestId('office-plan-office-basic'));

    await fireEvent.press(basic.getByText('3 د.ك'));
    await fireEvent.press(basic.getByText('اشتر الان'));

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/checkout',
      params: { purpose: 'plan', planSlug: 'office-basic', packageId: 'pkg-feat' },
    });
  });

  it('a bundle is bought whole', async () => {
    const screen = await renderScreen();
    await waitFor(() => expect(screen.getByTestId('office-plan-office-silver')).toBeTruthy());

    await fireEvent.press(
      within(screen.getByTestId('office-plan-office-silver')).getByText('اشتر الان'),
    );

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/checkout',
      params: { purpose: 'plan', planSlug: 'office-silver', packageId: 'pkg-44' },
    });
  });
});
