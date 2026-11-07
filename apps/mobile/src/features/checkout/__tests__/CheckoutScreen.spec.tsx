import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { paymentsService } from '@/shared/api/payments.service';

import CheckoutScreen from '../CheckoutScreen';
import { formatKwd, methodsForPlatform, successMessage } from '../checkoutText';
import type { CheckoutParams } from '../useCheckout';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: jest.fn(),
    canGoBack: () => true,
  }),
}));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `buyootna://${path}`,
  parse: (url: string) => ({
    queryParams: Object.fromEntries(new URL(url).searchParams.entries()),
  }),
}));
jest.mock('@/shared/api/payments.service', () => ({
  paymentsService: {
    quote: jest.fn(),
    createCharge: jest.fn(),
    createSubscriptionCharge: jest.fn(),
    createFeatureCharge: jest.fn(),
    getPaymentStatus: jest.fn(),
  },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const api = paymentsService as unknown as Record<string, jest.Mock>;
const openAuth = WebBrowser.openAuthSessionAsync as jest.Mock;

const quote = (over: object = {}) => ({
  title: 'الباقة الذهبية',
  subtitle: '5 إعلانات',
  price: 5,
  discount: 0,
  total: 5,
  currency: 'KWD',
  discountCode: null,
  methods: ['apple_pay', 'google_pay', 'card', 'knet'],
  ...over,
});

const PLAN: CheckoutParams = { purpose: 'plan', planSlug: 'gold', adsCount: 5 };

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });

async function renderScreen(params: CheckoutParams = PLAN) {
  const view = await render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CheckoutScreen params={params} />
    </QueryClientProvider>,
  );
  await view.findByTestId('checkout-purchase');
  return view;
}

describe('checkoutText', () => {
  it('formats KWD and the success text', () => {
    expect(formatKwd(3.75)).toBe('3.75 د.ك');
    expect(formatKwd(1.25, true)).toBe('-1.25 د.ك');
    expect(successMessage('plan', { planName: 'الذهبية' })).toBe(
      'تمت عملية الدفع بنجاح، وتم تفعيل الباقة الذهبية على حسابك.',
    );
  });

  it('offers Apple Pay only on iOS and Google Pay only on Android', () => {
    const all = ['knet', 'card', 'google_pay', 'apple_pay'] as const;
    expect(methodsForPlatform([...all], 'ios')).toEqual([
      'apple_pay',
      'card',
      'knet',
    ]);
    expect(methodsForPlatform([...all], 'android')).toEqual([
      'google_pay',
      'card',
      'knet',
    ]);
  });
});

describe('«الدفع»', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('ios');
    api.quote.mockResolvedValue(quote());
  });
  afterAll(() => setPlatform(originalOS as 'ios'));

  it('shows the server quote; «اتمام الدفع» waits for a method', async () => {
    const { getByTestId, queryByTestId } = await renderScreen();

    expect(api.quote).toHaveBeenCalledWith({ ...PLAN, discountCode: undefined });
    expect(getByTestId('checkout-summary-total')).toHaveTextContent('5 د.ك');
    expect(queryByTestId('checkout-method-google_pay')).toBeNull();
    expect(getByTestId('checkout-pay')).toBeDisabled();

    await fireEvent.press(getByTestId('checkout-method-knet'));
    expect(getByTestId('checkout-pay')).toBeEnabled();
  });

  it('applies a valid code and shows the server reason for a bad one', async () => {
    const { getByTestId, findByTestId } = await renderScreen();

    api.quote.mockRejectedValueOnce({
      response: { status: 400, data: { message: 'كود الخصم غير صالح' } },
    });
    await fireEvent.changeText(getByTestId('checkout-code-input'), 'NOPE');
    await fireEvent.press(getByTestId('checkout-code-apply'));
    expect(await findByTestId('checkout-code-error')).toHaveTextContent(
      'كود الخصم غير صالح',
    );

    api.quote.mockResolvedValue(
      quote({ discount: 1.25, total: 3.75, discountCode: 'SAVE25' }),
    );
    await fireEvent.changeText(getByTestId('checkout-code-input'), 'SAVE25');
    await fireEvent.press(getByTestId('checkout-code-apply'));

    expect(await findByTestId('checkout-code-applied')).toBeTruthy();
    expect(getByTestId('checkout-summary-discount')).toHaveTextContent(
      '-1.25 د.ك',
    );
    expect(getByTestId('checkout-summary-total')).toHaveTextContent('3.75 د.ك');
    // Read left to right as in the design: «-1.25 د.ك», not «د.ك 1.25-»
    for (const id of [
      'checkout-purchase-price',
      'checkout-summary-discount',
      'checkout-summary-total',
    ]) {
      expect(getByTestId(id)).toHaveStyle({ writingDirection: 'ltr' });
    }
  });

  it('pays on Tap with the chosen method and code, then shows success', async () => {
    api.createCharge.mockResolvedValue({
      invoiceId: 'inv-1',
      status: 'PENDING',
      checkoutUrl: 'https://tap/checkout',
    });
    openAuth.mockResolvedValue({
      type: 'success',
      url: 'buyootna://payment-callback?status=success',
    });
    api.getPaymentStatus.mockResolvedValue({ status: 'PAID', planName: 'الذهبية' });
    const { getByTestId, findByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('checkout-method-knet'));
    await fireEvent.press(getByTestId('checkout-pay'));

    expect(await findByTestId('checkout-result-success')).toBeTruthy();
    expect(api.createCharge).toHaveBeenCalledWith(
      'gold',
      'buyootna://payment-callback',
      undefined,
      5,
      { method: 'knet', discountCode: undefined },
    );
    expect(openAuth).toHaveBeenCalledWith(
      'https://tap/checkout',
      'buyootna://payment-callback',
    );
    expect(getByTestId('checkout-result-message')).toHaveTextContent(
      'تمت عملية الدفع بنجاح، وتم تفعيل الباقة الذهبية على حسابك.',
    );

    await fireEvent.press(getByTestId('checkout-result-backdrop'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('a declined payment shows «تعذر إتمام الدفع» with a retry', async () => {
    api.createCharge.mockResolvedValue({
      invoiceId: 'inv-2',
      status: 'PENDING',
      checkoutUrl: 'https://tap/checkout',
    });
    openAuth.mockResolvedValue({
      type: 'success',
      url: 'buyootna://payment-callback?status=failed',
    });
    const { getByTestId, findByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('checkout-method-card'));
    await fireEvent.press(getByTestId('checkout-pay'));

    expect(await findByTestId('checkout-result-failed')).toBeTruthy();
    await fireEvent.press(getByTestId('checkout-retry'));
    await waitFor(() => expect(api.createCharge).toHaveBeenCalledTimes(2));
  });

  it('a code covering the whole price is paid without opening Tap', async () => {
    api.createSubscriptionCharge.mockResolvedValue({
      invoiceId: 'inv-3',
      status: 'PAID',
    });
    api.getPaymentStatus.mockResolvedValue({ status: 'PAID' });
    const { getByTestId, findByTestId } = await renderScreen({
      purpose: 'subscription',
      companyPlanId: 'p12',
    });

    await fireEvent.press(getByTestId('checkout-method-card'));
    await fireEvent.press(getByTestId('checkout-pay'));

    expect(await findByTestId('checkout-result-success')).toBeTruthy();
    expect(openAuth).not.toHaveBeenCalled();
  });
});
