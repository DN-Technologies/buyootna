import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { companyService } from '@/shared/api/company.service';
import { companySubscriptionsService } from '@/shared/api/companySubscriptions.service';
import { paymentsService } from '@/shared/api/payments.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import CompanyAccountBalanceScreen from '../company-account-balance';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush, replace: jest.fn() }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `buyootna://${path}`,
}));
jest.mock('@/shared/api/companySubscriptions.service', () => ({
  companySubscriptionsService: {
    getPlans: jest.fn(),
    getMine: jest.fn(),
    getHistory: jest.fn(),
  },
}));
jest.mock('@/shared/api/company.service', () => ({
  companyService: { getMyServices: jest.fn() },
}));
jest.mock('@/shared/api/payments.service', () => ({
  paymentsService: { createSubscriptionCharge: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockPlans = companySubscriptionsService.getPlans as jest.Mock;
const mockMine = companySubscriptionsService.getMine as jest.Mock;
const mockHistory = companySubscriptionsService.getHistory as jest.Mock;
const mockServices = companyService.getMyServices as jest.Mock;
const mockCharge = paymentsService.createSubscriptionCharge as jest.Mock;

const FEATURES = ['استقبال الطلبات الخاصة.', 'اصدار الفواتير.'];
const quarterly = {
  id: 'p3',
  name: 'ثلاث شهور',
  price: 35,
  durationMonths: 3,
  features: FEATURES,
};
const historyRow = {
  id: 'period-1',
  displayId: 'ID:1A2B3C4D',
  planName: 'ثلاث شهور',
  startsAt: '2027-04-12T00:00:00Z',
  endsAt: '2027-07-12T00:00:00Z',
  status: 'ACTIVE',
};

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });

async function renderScreen(waitForTestID: string) {
  const view = await render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CompanyAccountBalanceScreen />
    </QueryClientProvider>,
  );
  await view.findByTestId(waitForTestID);
  return view;
}

describe('CompanyAccountBalanceScreen', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('android');
    useAuthStore.setState({ token: 'token' } as never);
    mockPlans.mockResolvedValue([{ ...quarterly, slug: 'quarterly', badge: null }]);
    mockHistory.mockResolvedValue([historyRow]);
    mockServices.mockResolvedValue({ services: [{ id: 's1' }], specialty: null });
  });
  afterAll(() => setPlatform(originalOS as 'ios' | 'android'));

  it('shows a skeleton, not a spinner, while the subscription loads', async () => {
    mockMine.mockReturnValue(new Promise(() => {}));

    const { getByTestId, queryByTestId } = await renderScreen(
      'company-balance-skeleton',
    );

    expect(getByTestId('company-balance-skeleton')).toBeTruthy();
    expect(queryByTestId('balance-plan-card')).toBeNull();
  });

  it('on a trial shows the countdown, its end date and the plans promo', async () => {
    mockMine.mockResolvedValue({
      status: 'TRIAL',
      currentPlanId: null,
      plan: null,
      endsAt: '2026-08-15T09:00:00Z',
      daysLeft: 14,
    });

    const { getByText, getByTestId, queryByTestId } = await renderScreen(
      'balance-trial-notice',
    );

    expect(getByText('أنت تستخدم النسخة التجريبية')).toBeTruthy();
    expect(getByText('يتبقى 14 يومًا للاستمتاع بجميع المميزات.')).toBeTruthy();
    expect(getByText('تنتهي في: 15 أغسطس 2026')).toBeTruthy();
    expect(getByText('حافظ على نمو شركتك')).toBeTruthy();
    expect(queryByTestId('balance-plan-card')).toBeNull();

    fireEvent.press(getByTestId('balance-browse-plans'));
    expect(mockPush).toHaveBeenCalledWith('/company-plans');
  });

  it('after the trial, with no plan ever bought, says the trial ended', async () => {
    mockMine.mockResolvedValue({
      status: 'EXPIRED',
      currentPlanId: null,
      plan: null,
      endsAt: '2026-08-15T09:00:00Z',
      daysLeft: 0,
    });

    const { getByText, queryByTestId } = await renderScreen(
      'balance-trial-ended-notice',
    );

    expect(getByText('انتهت الفترة التجريبية.')).toBeTruthy();
    expect(getByText('اشترك في إحدى الباقات لاستعادة جميع المميزات.')).toBeTruthy();
    expect(queryByTestId('balance-history')).toBeNull();
  });

  it('with a running plan shows it, its details on demand, and the history', async () => {
    mockMine.mockResolvedValue({
      status: 'ACTIVE',
      currentPlanId: 'p3',
      plan: quarterly,
      endsAt: '2027-07-12T09:00:00Z',
      daysLeft: 80,
    });

    const { getByText, getAllByText, getByTestId, queryByTestId, findByText } =
      await renderScreen('balance-plan-card');

    expect(getByText('الباقة الحالية')).toBeTruthy();
    expect(getByText('35 د.ك')).toBeTruthy();
    // On the plan card, and again on its row in the history once loaded
    expect(
      getAllByText('تاريخ الانتهاء: 12 يوليو 2027').length,
    ).toBeGreaterThan(0);
    // Subscribed and already offering a service: no nudge
    expect(queryByTestId('balance-add-service-notice')).toBeNull();

    expect(queryByTestId('balance-plan-features')).toBeNull();
    await act(async () => {
      fireEvent.press(getByTestId('balance-plan-details-toggle'));
    });
    expect(getByText('اصدار الفواتير.')).toBeTruthy();

    expect(await findByText('ID:1A2B3C4D')).toBeTruthy();
    fireEvent.press(getByTestId('balance-history-all'));
    expect(mockPush).toHaveBeenCalledWith('/company-subscription-history');
  });

  it('nudges a subscribed company with no services to add its first', async () => {
    mockServices.mockResolvedValue({ services: [], specialty: null });
    mockMine.mockResolvedValue({
      status: 'ACTIVE',
      currentPlanId: 'p3',
      plan: quarterly,
      endsAt: '2027-07-12T09:00:00Z',
      daysLeft: 80,
    });

    const { findByText } = await renderScreen('balance-plan-card');

    expect(
      await findByText('لديك رصيد متاح ابدأ باضافة أول خدماتك.'),
    ).toBeTruthy();
  });

  const expired = {
    status: 'EXPIRED',
    currentPlanId: null,
    plan: quarterly,
    endsAt: '2027-07-12T09:00:00Z',
    daysLeft: 0,
  };

  it('with an expired plan on Android offers browsing and renewing the same plan', async () => {
    mockMine.mockResolvedValue(expired);
    mockCharge.mockResolvedValue({
      checkoutUrl: 'https://tap/checkout',
      invoiceId: 'inv-1',
      status: 'PENDING',
    });

    const { getByText, getByTestId, findByText } = await renderScreen(
      'balance-plan-expired-tag',
    );

    expect(
      getByText('نفذت الباقة لديك. قم بشراء باقة لتتمكن من النشر.'),
    ).toBeTruthy();
    // The plans list has to be in before a renewal can name the plan
    await findByText('ID:1A2B3C4D');
    await act(async () => {
      fireEvent.press(getByTestId('balance-renew-plan'));
    });

    expect(mockCharge).toHaveBeenCalledWith('p3', 'buyootna://payment-callback');
  });

  it('with an active plan on iOS shows the plan without its price', async () => {
    setPlatform('ios');
    mockMine.mockResolvedValue({
      status: 'ACTIVE',
      currentPlanId: 'p3',
      plan: quarterly,
      endsAt: '2027-07-12T09:00:00Z',
      daysLeft: 80,
    });

    const { getByText, queryByTestId, queryByText } =
      await renderScreen('balance-plan-card');

    expect(getByText('الباقة الحالية')).toBeTruthy();
    expect(queryByTestId('balance-plan-price')).toBeNull();
    expect(queryByText(/د\.ك/)).toBeNull();
  });

  it('with an expired plan on iOS shows no renew button and no purchase wording', async () => {
    setPlatform('ios');
    mockMine.mockResolvedValue(expired);

    const { getByText, getByTestId, queryByTestId, queryByText } =
      await renderScreen('balance-plan-expired-tag');

    expect(getByText('نفذت الباقة لديك.')).toBeTruthy();
    expect(queryByTestId('balance-renew-plan')).toBeNull();
    expect(queryByText(/شراء|اشترك/)).toBeNull();
    expect(getByTestId('balance-browse-plans')).toBeTruthy();
    expect(mockCharge).not.toHaveBeenCalled();
  });
});
