import { render } from '@testing-library/react-native';

import { showAlert } from '@/shared/utils/alert';

import PaymentCallbackScreen from '../payment-callback';

const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock('expo-web-browser', () => ({ dismissBrowser: jest.fn() }));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const mockShowAlert = showAlert as jest.Mock;

// Presses the alert's only button and returns where it navigated
const okDestination = () => {
  const buttons = mockShowAlert.mock.calls[0][2] as { onPress: () => void }[];
  buttons[0].onPress();
  return mockReplace.mock.calls[0][0];
};

describe('PaymentCallbackScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirms a plan purchase and returns to /plans', async () => {
    mockParams = { status: 'success', invoiceId: 'inv-1' };
    await render(<PaymentCallbackScreen />);

    expect(mockShowAlert.mock.calls[0][1]).toBe(
      'تمت عملية الدفع وتفعيل الباقة بنجاح!',
    );
    expect(okDestination()).toBe('/plans');
  });

  it('confirms a featured ad and returns to My Activity', async () => {
    mockParams = { status: 'success', invoiceId: 'inv-1', purpose: 'feature' };
    await render(<PaymentCallbackScreen />);

    expect(mockShowAlert.mock.calls[0][1]).toBe('تم الدفع وتمييز إعلانك بنجاح!');
    expect(okDestination()).toBe('/activity');
  });

  it('reports a failed feature payment and returns to My Activity', async () => {
    mockParams = { status: 'failed', invoiceId: 'inv-1', purpose: 'feature' };
    await render(<PaymentCallbackScreen />);

    expect(mockShowAlert.mock.calls[0][0]).toBe('خطأ');
    expect(okDestination()).toBe('/activity');
  });
});
