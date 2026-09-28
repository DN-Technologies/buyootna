import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode } from 'react';

import { paymentsService } from '@/shared/api/payments.service';
import { showAlert } from '@/shared/utils/alert';

import { useFeatureAd } from '../useFeatureAd';

jest.mock('expo-linking', () => ({
  createURL: (path: string) => `buyootna://${path}`,
  parse: (url: string) => ({
    queryParams: Object.fromEntries(new URL(url).searchParams),
  }),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('@/shared/api/payments.service', () => ({
  paymentsService: {
    getFeaturePackages: jest.fn(),
    createFeatureCharge: jest.fn(),
    getPaymentStatus: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const WEEK = {
  id: 'feature-week',
  label: 'تمييز لاسبوع',
  description: '',
  durationDays: 7,
  price: 3,
};

const mockGetPackages = paymentsService.getFeaturePackages as jest.Mock;
const mockCreateCharge = paymentsService.createFeatureCharge as jest.Mock;
const mockGetStatus = paymentsService.getPaymentStatus as jest.Mock;
const mockOpenAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;

let queryClient: QueryClient;

async function setup(propertyId?: string) {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = await renderHook(() => useFeatureAd(propertyId), { wrapper });
  return utils;
}

// Loads the packages and picks the week one
async function setupWithWeekSelected() {
  const utils = await setup('prop-1');
  await waitFor(() => expect(utils.result.current.packages).toHaveLength(1));
  await act(() => utils.result.current.selectPackage('feature-week'));
  return utils;
}

describe('useFeatureAd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPackages.mockResolvedValue([WEEK]);
    mockCreateCharge.mockResolvedValue({
      checkoutUrl: 'https://checkout.tap.company/x',
      invoiceId: 'inv-1',
      status: 'PENDING',
    });
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('does not fetch packages until an ad is being featured', async () => {
    await setup(undefined);

    expect(mockGetPackages).not.toHaveBeenCalled();
  });

  it('exposes the selected package from the server list', async () => {
    const { result } = await setupWithWeekSelected();

    expect(result.current.selectedPackage).toEqual(WEEK);
  });

  it('succeeds when checkout lands back in the app with status=success', async () => {
    mockOpenAuthSession.mockResolvedValue({
      type: 'success',
      url: 'buyootna://payment-callback?status=success&invoiceId=inv-1',
    });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('success');
    expect(result.current.isProcessing).toBe(false);
  });

  it('fails when checkout lands back with status=failed', async () => {
    mockOpenAuthSession.mockResolvedValue({
      type: 'success',
      url: 'buyootna://payment-callback?status=failed&invoiceId=inv-1',
    });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('failed');
  });

  it('asks the server when the browser was closed, and trusts a PAID invoice', async () => {
    mockOpenAuthSession.mockResolvedValue({ type: 'dismiss' });
    mockGetStatus.mockResolvedValue({ status: 'PAID' });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(mockGetStatus).toHaveBeenCalledWith('inv-1');
    expect(outcome).toBe('success');
  });

  it('treats a closed browser with an unpaid invoice as cancelled', async () => {
    mockOpenAuthSession.mockResolvedValue({ type: 'cancel' });
    mockGetStatus.mockResolvedValue({ status: 'PENDING' });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('cancelled');
  });

  it('skips the gateway when the server already marked it paid (free package)', async () => {
    mockCreateCharge.mockResolvedValue({
      checkoutUrl: null,
      invoiceId: 'inv-1',
      status: 'PAID',
    });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('success');
    expect(mockOpenAuthSession).not.toHaveBeenCalled();
  });

  it('shows the server message once when the charge is refused', async () => {
    mockCreateCharge.mockRejectedValue({
      response: {
        status: 400,
        data: { message: 'يمكن تمييز الإعلانات المنشورة فقط' },
      },
    });
    const { result } = await setupWithWeekSelected();

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('error');
    expect(showAlert).toHaveBeenCalledTimes(1);
    expect(showAlert).toHaveBeenCalledWith(
      'خطأ',
      'يمكن تمييز الإعلانات المنشورة فقط',
    );
  });

  it('does nothing without a selected package', async () => {
    const { result } = await setup('prop-1');

    let outcome;
    await act(async () => {
      outcome = await result.current.checkout();
    });

    expect(outcome).toBe('cancelled');
    expect(mockCreateCharge).not.toHaveBeenCalled();
  });
});
