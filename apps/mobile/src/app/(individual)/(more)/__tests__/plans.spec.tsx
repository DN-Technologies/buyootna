import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { paymentsService } from '@/shared/api/payments.service';
import { plansService } from '@/shared/api/plans.service';

import PlansScreen from '../plans';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    replace: jest.fn(),
  }),
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
      },
    ]);
    (plansService.getWallet as jest.Mock).mockResolvedValue({
      freeAdsRemaining: 1,
      slots: [],
    });
  });

  it('renders the header and both plan cards with features and options', async () => {
    const { getByText, getAllByText } = await renderWithClient(<PlansScreen />);

    // Header
    expect(getByText('الباقات')).toBeTruthy();

    await waitFor(() => {
      // Basic plan card
      expect(getByText('الباقة الاساسية')).toBeTruthy();
      expect(getAllByText('مدة النشر 30 يوم.').length).toBe(2);
      expect(getByText('حتى 5 صورة للعقار.')).toBeTruthy();
      expect(getByText('ظهور في نتائج البحث.')).toBeTruthy();
      expect(getByText('تواصل مباشر مع المهتمين.')).toBeTruthy();
      expect(getByText('باقة 2 اعلان')).toBeTruthy();
      expect(getByText('10 د.ك')).toBeTruthy();
      expect(getAllByText('باقة 5 اعلانات').length).toBe(2);
      expect(getByText('22.5 د.ك')).toBeTruthy();

      // Gold plan card
      expect(getByText('الباقة الذهبية')).toBeTruthy();
      expect(getByText('موصى به')).toBeTruthy();
      expect(getByText('تمييز الاعلانات.')).toBeTruthy();
      expect(getByText('حتى 15 صورة للعقار.')).toBeTruthy();
      expect(getByText('ظهور في أعلى نتائج البحث.')).toBeTruthy();
      expect(getByText('اولوية الظهور في البحث الجغرافي.')).toBeTruthy();
      expect(getByText('باقة 1 اعلان')).toBeTruthy();
      expect(getByText('12 د.ك')).toBeTruthy();
      expect(getByText('50 د.ك')).toBeTruthy();
    });
  });

  it('handles plan purchase via paymentsService and opens browser', async () => {
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
      expect(paymentsService.createCharge).toHaveBeenCalledWith(
        'regular',
        expect.stringContaining('payment-callback'),
        undefined,
        2,
      );
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        'https://payment.tap.company/test',
      );
    });
  });

  it('allows selecting different package options before purchasing', async () => {
    (paymentsService.createCharge as jest.Mock).mockResolvedValue({
      id: 'charge_456',
      status: 'INITIATED',
      checkoutUrl: 'https://payment.tap.company/gold-test',
    });

    const { getByText, getAllByText } = await renderWithClient(<PlansScreen />);

    await waitFor(() => {
      expect(getAllByText('باقة 5 اعلانات').length).toBe(2);
    });

    // Select the 5-ads gold option
    const gold5Option = getByText('50 د.ك');
    await fireEvent.press(gold5Option);

    const buyButtons = getAllByText('اشتر الان');
    // Click gold buy button (second button)
    await fireEvent.press(buyButtons[1]);

    await waitFor(() => {
      expect(paymentsService.createCharge).toHaveBeenCalledWith(
        'gold',
        expect.stringContaining('payment-callback'),
        undefined,
        5,
      );
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
        'https://payment.tap.company/gold-test',
      );
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
    // Basic has no packages from the API, so its hardcoded prices remain
    expect(getByText('22.5 د.ك')).toBeTruthy();
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
