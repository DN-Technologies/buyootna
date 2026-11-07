import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';

import { paymentsService } from '@/shared/api/payments.service';

import FeatureAdSheet from '../FeatureAdSheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const MockBottomSheetModal = React.forwardRef(
    function MockBottomSheetModal(
      { children }: { children: React.ReactNode },
      _ref: any,
    ) {
      return <>{children}</>;
    },
  );
  MockBottomSheetModal.displayName = 'BottomSheetModal';

  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    BottomSheetBackdrop: () => null,
  };
});

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

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (...a: unknown[]) => mockRouterPush(...a) } }));

// Prices come from the server (admin-editable), not the app
const PACKAGES = [
  {
    id: 'feature-day',
    label: 'تمييز ليوم',
    description: 'تعزيز سريع للإعلان.',
    durationDays: 1,
    price: 1,
  },
  {
    id: 'feature-week',
    label: 'تمييز لاسبوع',
    description: 'ظهور أقوى لمدة أطول.',
    durationDays: 7,
    price: 3,
  },
  {
    id: 'feature-month',
    label: 'تمييز لشهر',
    description: 'أفضل انتشار لإعلانك.',
    durationDays: 30,
    price: 4.5,
  },
];

const mockGetPackages = paymentsService.getFeaturePackages as jest.Mock;
const mockCreateCharge = paymentsService.createFeatureCharge as jest.Mock;
const mockOpenAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;

async function renderSheet(props: React.ComponentProps<typeof FeatureAdSheet> = {
  propertyId: 'prop-123',
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <FeatureAdSheet {...props} />
    </QueryClientProvider>,
  );
  return { ...utils, queryClient };
}

describe('FeatureAdSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPackages.mockResolvedValue(PACKAGES);
    mockCreateCharge.mockResolvedValue({
      checkoutUrl: 'https://checkout.tap.company/x',
      invoiceId: 'inv-1',
      status: 'PENDING',
    });
  });

  it('renders the title, benefits and the server’s packages, without the coupon banner', async () => {
    const { findByText, getByText, queryByText } = await renderSheet();

    expect(getByText('تمييز الإعلان')).toBeTruthy();
    expect(getByText('ميز اعلانك حتى:')).toBeTruthy();
    expect(getByText('اختر الباقة المناسبة لك')).toBeTruthy();

    expect(await findByText('تمييز ليوم')).toBeTruthy();
    expect(getByText('1 د.ك')).toBeTruthy();
    expect(getByText('تمييز لاسبوع')).toBeTruthy();
    expect(getByText('3 د.ك')).toBeTruthy();
    expect(getByText('تمييز لشهر')).toBeTruthy();
    expect(getByText('4.5 د.ك')).toBeTruthy();

    // The coupon can't be redeemed yet, so it isn't advertised
    expect(queryByText(/BYOUTNA10/)).toBeNull();

    // Nothing selected: the CTA shows no price and is inactive
    expect(getByText('إتمام الدفع')).toBeTruthy();
  });

  it('shows the selected package price on the CTA and lets the user switch', async () => {
    const { findByTestId, getByText } = await renderSheet();

    await fireEvent.press(await findByTestId('package-option-feature-day'));
    expect(getByText('إتمام الدفع • 1 د.ك')).toBeTruthy();

    await fireEvent.press(await findByTestId('package-option-feature-month'));
    expect(getByText('إتمام الدفع • 4.5 د.ك')).toBeTruthy();
  });

  // «الدفع» (Figma 5557:142956) takes over: «كود الخصم», the method, Tap
  // and the outcome popup; the sheet only picks the package
  it('opens the payment screen with the ad and the package, without charging', async () => {
    const { findByTestId, getByTestId } = await renderSheet({
      propertyId: 'prop-123',
    });

    await fireEvent.press(await findByTestId('package-option-feature-week'));
    await fireEvent.press(getByTestId('feature-ad-checkout-button'));

    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/checkout',
      params: {
        purpose: 'feature',
        propertyId: 'prop-123',
        featurePackageId: 'feature-week',
      },
    });
    expect(mockCreateCharge).not.toHaveBeenCalled();
    expect(mockOpenAuthSession).not.toHaveBeenCalled();
  });

  it('does nothing until a package is picked', async () => {
    const { getByTestId, findByTestId } = await renderSheet();
    await findByTestId('package-option-feature-week');
    await fireEvent.press(getByTestId('feature-ad-checkout-button'));
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('offers a retry when the packages fail to load', async () => {
    mockGetPackages.mockRejectedValueOnce(new Error('offline'));
    const { findByText } = await renderSheet();

    expect(await findByText('تعذر تحميل الباقات')).toBeTruthy();
    mockGetPackages.mockResolvedValue(PACKAGES);
    await fireEvent.press(await findByText('إعادة المحاولة'));
    expect(await findByText('تمييز ليوم')).toBeTruthy();
  });
});
