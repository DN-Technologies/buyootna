import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { companyRequestsService } from '@/shared/api/companyRequests.service';

import EndRequestScreen from '../EndRequestScreen';

const mockBack = jest.fn();
const mockNavigate = jest.fn();
const mockDismissAll = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    navigate: mockNavigate,
    dismissAll: mockDismissAll,
    canDismiss: () => true,
  }),
}));

jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: { complete: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const renderScreen = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EndRequestScreen id="req-1" />
    </QueryClientProvider>,
  );

describe('EndRequestScreen (انهاء الطلب)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('تحديث الحالة waits for an answer; نعم also needs where', async () => {
    const { getByTestId, queryByText } = await renderScreen();
    const submit = getByTestId('end-request-submit');

    expect(submit).toBeDisabled();
    expect(queryByText('أين تم الاتفاق النهائي؟')).toBeNull();

    await fireEvent.press(getByTestId('end-request-finished-yes'));
    expect(queryByText('أين تم الاتفاق النهائي؟')).toBeTruthy();
    expect(submit).toBeDisabled();

    await fireEvent.press(getByTestId('end-request-via-outside'));
    expect(submit).not.toBeDisabled();
  });

  it('«لا، مازال الطلب مستمرًا» changes nothing', async () => {
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('end-request-finished-no'));
    await fireEvent.press(getByTestId('end-request-submit'));

    expect(companyRequestsService.complete).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('نعم + من خلال التطبيق ends it and goes to the list', async () => {
    (companyRequestsService.complete as jest.Mock).mockResolvedValue({});
    const { getByTestId } = await renderScreen();

    await fireEvent.press(getByTestId('end-request-finished-yes'));
    await fireEvent.press(getByTestId('end-request-via-in_app'));
    await fireEvent.press(getByTestId('end-request-submit'));

    await waitFor(() =>
      expect(companyRequestsService.complete).toHaveBeenCalledWith('req-1', 'in_app'),
    );
    expect(mockDismissAll).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/(company)/company-requests',
      params: { ended: '1' },
    });
  });
});
