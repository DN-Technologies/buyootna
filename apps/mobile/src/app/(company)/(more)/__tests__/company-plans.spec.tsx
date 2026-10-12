import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { companySubscriptionsService } from '@/shared/api/companySubscriptions.service';
import { paymentsService } from '@/shared/api/payments.service';
import { showAlert } from '@/shared/utils/alert';

import CompanyPlansScreen from '../company-plans';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush, replace: jest.fn() }),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `buyootna://${path}`,
}));
jest.mock('@/shared/api/companySubscriptions.service', () => ({
  companySubscriptionsService: { getPlans: jest.fn(), getMine: jest.fn() },
}));
jest.mock('@/shared/api/payments.service', () => ({
  paymentsService: { createSubscriptionCharge: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockPlans = companySubscriptionsService.getPlans as jest.Mock;
const mockMine = companySubscriptionsService.getMine as jest.Mock;
const mockCharge = paymentsService.createSubscriptionCharge as jest.Mock;
const mockAlert = showAlert as jest.Mock;

const FEATURES = ['استقبال الطلبات الخاصة.', 'إضافة خدمات.'];
const plans = [
  { id: 'p3', slug: 'quarterly', name: 'ثلاث شهور', durationMonths: 3, price: 35, features: FEATURES, badge: null },
  { id: 'p6', slug: 'half-year', name: '6 شهور', durationMonths: 6, price: 60, features: FEATURES, badge: null },
  { id: 'p12', slug: 'annual', name: 'السنوية', durationMonths: 12, price: 100, features: FEATURES, badge: 'الأكثر طلبا' },
];

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });

async function renderScreen() {
  const view = await render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CompanyPlansScreen />
    </QueryClientProvider>,
  );
  await view.findByText('ثلاث شهور');
  return view;
}

describe('CompanyPlansScreen', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlans.mockResolvedValue(plans);
    mockMine.mockResolvedValue({
      status: 'TRIAL',
      currentPlanId: null,
      endsAt: null,
      daysLeft: 20,
    });
  });
  afterAll(() => setPlatform(originalOS as 'ios' | 'android'));

  it('lists the three plans with their prices and the most-popular tag', async () => {
    setPlatform('android');
    const { getByText, queryByTestId } = await renderScreen();

    expect(getByText('35 دينار كويتي')).toBeTruthy();
    expect(queryByTestId('in-app-purchase-notice')).toBeNull();
    expect(getByText('60 دينار كويتي')).toBeTruthy();
    expect(getByText('100 دينار كويتي')).toBeTruthy();
    expect(getByText('الأكثر طلبا')).toBeTruthy();
    // On a trial no plan is the current one
    expect(queryByTestId('current-plan-tag')).toBeNull();
  });

  it('tags the current plan and does not let it be bought again', async () => {
    setPlatform('android');
    mockMine.mockResolvedValue({
      status: 'ACTIVE',
      currentPlanId: 'p3',
      endsAt: null,
      daysLeft: 80,
    });

    const { findByTestId, getByTestId } = await renderScreen();

    expect(await findByTestId('current-plan-tag')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByTestId('subscribe-quarterly'));
    });
    expect(mockCharge).not.toHaveBeenCalled();
  });

  it('on iOS shows the plans without prices or a subscribe button, and never where to pay', async () => {
    setPlatform('ios');
    mockMine.mockResolvedValue({
      status: 'ACTIVE',
      currentPlanId: 'p3',
      endsAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 40,
    });

    const { getByText, getByTestId, queryByText, queryByTestId, findByTestId } =
      await renderScreen();

    // What a subscription includes, and which plan the company is on
    expect(getByText('السنوية')).toBeTruthy();
    expect(await findByTestId('current-plan-tag')).toBeTruthy();
    expect(getByTestId('subscription-ends')).toBeTruthy();

    // Nothing to buy and nothing pointing at another way to pay
    expect(queryByText('100 دينار كويتي')).toBeNull();
    expect(queryByText('اشترك الان')).toBeNull();
    expect(queryByTestId('subscribe-annual')).toBeNull();
    expect(
      getByText('لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.'),
    ).toBeTruthy();
    expect(queryByText(/موقع|المتصفح|الويب/)).toBeNull();
    expect(mockCharge).not.toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('on Android opens the payment gateway for the chosen plan', async () => {
    setPlatform('android');
    mockCharge.mockResolvedValue({
      checkoutUrl: 'https://tap/checkout',
      invoiceId: 'inv-1',
      status: 'PENDING',
    });
    const { getByTestId } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByTestId('subscribe-annual'));
    });

    expect(mockCharge).toHaveBeenCalledWith(
      'p12',
      'buyootna://payment-callback',
    );
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://tap/checkout',
    );
  });

  it('on Android shows the server error when the charge fails', async () => {
    setPlatform('android');
    mockCharge.mockRejectedValue({
      response: { data: { message: 'الباقة غير موجودة أو غير نشطة' } },
    });
    const { getByTestId } = await renderScreen();

    await act(async () => {
      fireEvent.press(getByTestId('subscribe-half-year'));
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'خطأ',
      'الباقة غير موجودة أو غير نشطة',
    );
  });
});

describe('handleSubscriptionRequired', () => {
  const router = { push: mockPush } as never;

  beforeEach(() => jest.clearAllMocks());

  it('offers the plans when the API says a subscription is required', () => {
    const handled = handleSubscriptionRequired(
      { response: { data: { code: 'SUBSCRIPTION_REQUIRED' } } },
      router,
    );

    expect(handled).toBe(true);
    const [title, , buttons] = mockAlert.mock.calls[0] as [
      string,
      string,
      { text: string; onPress?: () => void }[],
    ];
    // Jest runs as iOS, where the prompt doesn't ask anyone to subscribe
    expect(title).toBe('انتهت باقة شركتك');
    buttons.find((b) => b.text === 'عرض الباقات')?.onPress?.();
    expect(mockPush).toHaveBeenCalledWith('/company-plans');
  });

  it('leaves any other error to the caller', () => {
    expect(
      handleSubscriptionRequired({ response: { data: { code: 'OTHER' } } }, router),
    ).toBe(false);
    expect(mockAlert).not.toHaveBeenCalled();
  });
});
