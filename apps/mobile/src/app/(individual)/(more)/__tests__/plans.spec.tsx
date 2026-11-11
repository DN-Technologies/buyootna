import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { paymentsService } from '@/shared/api/payments.service';
import { plansService } from '@/shared/api/plans.service';

import PlansScreen from '../plans';

const mockBack = jest.fn();

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: jest.fn(),
  }),
  router: { push: (...args: unknown[]) => mockRouterPush(...args) },
}));

jest.mock('expo-linking', () => ({
  createURL: (path: string) => `buyootna://${path}`,
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(),
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: {
    getPromo: jest.fn(),
    getPlans: jest.fn(),
    getWallet: jest.fn(),
  },
}));

jest.mock('@/shared/api/payments.service', () => ({
  paymentsService: {
    createCharge: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

async function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return await render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('PlansScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (plansService.getPlans as jest.Mock).mockResolvedValue([
      {
        id: 'basic-plan',
        slug: 'regular',
        name: 'الباقة الاساسية',
        price: 10,
        originalPrice: null,
        discountText: null,
        badge: null,
        features: [],
        color: '#15304D',
        packages: [
          { id: 'pkg-basic-1', adsCount: 1, price: 2 },
          { id: 'pkg-basic-3', adsCount: 3, price: 6 },
        ],
      },
      {
        id: 'gold-plan',
        slug: 'gold',
        name: 'الباقة الذهبية',
        price: 12,
        originalPrice: null,
        discountText: null,
        badge: 'موصى به',
        features: [],
        color: '#D06400',
        packages: [
          { id: 'pkg-gold-1', adsCount: 1, price: 7 },
          { id: 'pkg-gold-3', adsCount: 3, price: 17.5 },
        ],
      },
    ]);
    (plansService.getPromo as jest.Mock).mockResolvedValue(null);
    (plansService.getWallet as jest.Mock).mockResolvedValue({
      freeAdsRemaining: 1,
      slots: [],
    });
  });

  it('renders the header and both plan cards with features and options', async () => {
    const { getByText, getAllByText, queryByTestId } = await renderWithClient(
      <PlansScreen />,
    );

    // Header
    expect(getByText('الباقات')).toBeTruthy();

    await waitFor(() => {
      // Basic plan card
      expect(getByText('الباقة الاساسية')).toBeTruthy();
      expect(getAllByText('مدة النشر 30 يوم.').length).toBe(2);
      expect(getByText('حتى 5 صورة للعقار.')).toBeTruthy();
      expect(getByText('ظهور في نتائج البحث.')).toBeTruthy();
      expect(getByText('تواصل مباشر مع المهتمين.')).toBeTruthy();
      // The owner's prices (Figma 10180:55265), from the backend's packages
      expect(getAllByText('باقة 1 اعلان').length).toBe(2);
      expect(getAllByText('باقة 3 اعلانات').length).toBe(2);
      expect(getByText('2 د.ك')).toBeTruthy();
      expect(getByText('6 د.ك')).toBeTruthy();

      // Gold plan card
      expect(getByText('الباقة الذهبية')).toBeTruthy();
      expect(getByText('موصى به')).toBeTruthy();
      expect(getByText('تمييز الاعلانات.')).toBeTruthy();
      expect(getByText('حتى 15 صورة للعقار.')).toBeTruthy();
      expect(getByText('ظهور في أعلى نتائج البحث.')).toBeTruthy();
      expect(getByText('اولوية الظهور في البحث الجغرافي.')).toBeTruthy();
      expect(getByText('7 د.ك')).toBeTruthy();
      expect(getByText('17.5 د.ك')).toBeTruthy();
    });
    // No advertised code: no banner
    expect(queryByTestId('plans-promo')).toBeNull();
  });

  // «اشتر الان» opens «الدفع» (Figma 5557:142956), which charges through Tap
  it('opens the payment screen for the chosen package', async () => {
    (paymentsService.createCharge as jest.Mock).mockResolvedValue({
      id: 'charge_123',
      status: 'INITIATED',
      checkoutUrl: 'https://payment.tap.company/test',
    });

    const { getAllByText } = await renderWithClient(<PlansScreen />);

    await waitFor(() => {
      expect(getAllByText('اشتر الان').length).toBe(2);
    });

    const buyButtons = getAllByText('اشتر الان');
    // Click basic buy button
    await fireEvent.press(buyButtons[0]);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/checkout',
        params: { purpose: 'plan', planSlug: 'regular', adsCount: '1' },
      });
    });
    expect(paymentsService.createCharge).not.toHaveBeenCalled();
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('allows selecting different package options before purchasing', async () => {
    (paymentsService.createCharge as jest.Mock).mockResolvedValue({
      id: 'charge_456',
      status: 'INITIATED',
      checkoutUrl: 'https://payment.tap.company/gold-test',
    });

    const { getByText, getAllByText } = await renderWithClient(<PlansScreen />);

    await waitFor(() => {
      expect(getAllByText('باقة 3 اعلانات').length).toBe(2);
    });

    // Select the 3-ads gold option
    await fireEvent.press(getByText('17.5 د.ك'));

    const buyButtons = getAllByText('اشتر الان');
    // Click gold buy button (second button)
    await fireEvent.press(buyButtons[1]);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: '/checkout',
        params: { purpose: 'plan', planSlug: 'gold', adsCount: '3' },
      });
    });
  });

  it('shows the backend package price instead of the hardcoded one', async () => {
    (plansService.getPlans as jest.Mock).mockResolvedValue([
      {
        id: 'gold-plan',
        slug: 'gold',
        name: 'الباقة الذهبية',
        price: 12,
        originalPrice: null,
        discountText: null,
        badge: 'موصى به',
        features: [],
        color: '#D06400',
        packages: [
          { id: 'pkg-gold-1', adsCount: 1, price: 12 },
          { id: 'pkg-gold-5', adsCount: 5, price: 55 },
        ],
      },
    ]);

    const { getByText, queryByText } = await renderWithClient(<PlansScreen />);

    await waitFor(() => {
      expect(getByText('55 د.ك')).toBeTruthy();
    });
    expect(queryByText('50 د.ك')).toBeNull();
    // Basic has no packages from the API: its built-in options (the new prices)
    expect(getByText('6 د.ك')).toBeTruthy();
  });

  // «خصم 10% عند استخدامك كود "BYOUTNA10".» (Figma 10180:55408)
  it.each([
    [{ code: 'BYOUTNA10', type: 'PERCENT', value: 10 }, 'خصم 10% عند استخدامك كود '],
    [{ code: 'KWD1', type: 'FIXED', value: 1 }, 'خصم 1 د.ك عند استخدامك كود '],
  ])('shows the advertised code above the plans: %j', async (promo, lead) => {
    (plansService.getPromo as jest.Mock).mockResolvedValue(promo);

    const { findByTestId } = await renderWithClient(<PlansScreen />);

    const banner = await findByTestId('plans-promo');
    expect(banner).toHaveTextContent(`${lead}“${promo.code}”.`);
    expect(plansService.getPromo).toHaveBeenCalledWith('PLAN');
  });

  it('wallet section shows the real free-ad balance, not a hardcoded 1 (QA: quota mismatch)', async () => {
    (plansService.getWallet as jest.Mock).mockResolvedValue({
      freeAdsRemaining: 3,
      slots: [],
    });

    const { getByText, queryByText } = await renderWithClient(<PlansScreen />);

    await waitFor(() => {
      expect(getByText('متبقي 3 إعلانات')).toBeTruthy();
    });
    expect(queryByText('متبقي إعلان مجاني واحد')).toBeNull();
  });

  it('wallet section uses the singular wording for a single free ad and hides entirely at zero', async () => {
    (plansService.getWallet as jest.Mock).mockResolvedValue({
      freeAdsRemaining: 1,
      slots: [],
    });
    const { getByText } = await renderWithClient(<PlansScreen />);
    await waitFor(() => {
      expect(getByText('متبقي إعلان مجاني واحد')).toBeTruthy();
    });

    // Zero balance and no slots: the whole wallet section disappears
    (plansService.getWallet as jest.Mock).mockResolvedValue({
      freeAdsRemaining: 0,
      slots: [],
    });
    const { queryByText } = await renderWithClient(<PlansScreen />);
    await waitFor(() => {
      expect(queryByText('محفظتك الإعلانية')).toBeNull();
    });
  });
});
