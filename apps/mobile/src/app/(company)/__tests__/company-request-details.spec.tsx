import { fireEvent, render } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import { CompanyRequestItem } from '@/features/company/components/requests';
import { useCompanyRequestDetails } from '@/features/company/hooks/useCompanyRequestDetails';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { resetLinkThrottle } from '@/shared/utils/openUrl';

import CompanyRequestDetailsScreen from '../(requests)/[id]';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({ id: 'req-1' }),
}));

jest.mock('@/features/company/hooks/useCompanyRequestDetails', () => ({
  useCompanyRequestDetails: jest.fn(),
}));

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { createConversation: jest.fn() },
}));

jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: {
    accept: jest.fn(),
    reject: jest.fn(),
    markResponded: jest.fn(),
  },
}));

jest.spyOn(Alert, 'alert');
jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);

const mockUseCompanyRequestDetails = useCompanyRequestDetails as jest.Mock;

const BASE_REQUEST: CompanyRequestItem = {
  id: 'req-1',
  clientIdentityId: 'client-1',
  title: 'تشطيب كامل لمحل تجاري',
  requestNumber: 'طلب رقم 01#',
  category: 'تشطيب و ديكور',
  clientName: 'نواف الجارحي',
  priceRange: '22,000 - 15,000 د.ك',
  location: 'شمال غرب صليبيخات',
  attachmentsCount: 3,
  offerType: 'عرض مخصص',
  images: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  ],
  description: 'شقة للبيع بموقع مميز وتشطيب راقٍ.',
  latitude: 29.3759,
  longitude: 47.9774,
  status: 'pending',
  scope: 'company',
  createdAt: '2026-06-01T00:00:00.000Z',
  client: {
    name: 'نواف الجارحي',
    joinedDate: '2026-06-15T00:00:00.000Z',
    previousOffers: 5,
    rating: 3.5,
    phone: '+96590000000',
    whatsapp: '+96590000000',
    isVerified: true,
  },
};

function mockDetails(overrides: Partial<CompanyRequestItem> = {}) {
  mockUseCompanyRequestDetails.mockReturnValue({
    data: { ...BASE_REQUEST, ...overrides },
    isLoading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue({}),
  });
}

describe('CompanyRequestDetailsScreen (real data)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The call/WhatsApp asserts below press links back-to-back; the
    // openUrlThrottled burst lock must start clean for each test.
    resetLinkThrottle();
    mockDetails();
  });

  it('renders header with title "تفاصيل الطلب", back button, and options button', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByTestId('request-details-title')).toBeTruthy();
    expect(getByText('تفاصيل الطلب')).toBeTruthy();
    expect(getByTestId('request-details-back-button')).toBeTruthy();
    expect(getByTestId('request-details-options-button')).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    const { getByTestId } = await render(<CompanyRequestDetailsScreen />);

    await fireEvent.press(getByTestId('request-details-back-button'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders title card with title, request number, category, and status badge', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByTestId('request-details-item-title')).toBeTruthy();
    expect(getByText('تشطيب كامل لمحل تجاري')).toBeTruthy();
    expect(getByText('طلب رقم 01# • تشطيب و ديكور')).toBeTruthy();
    expect(getByText('قيد الانتظار')).toBeTruthy();
  });

  it('renders 2x2 key info grid with location, budget, publish time, and offer type', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByText('الموقع')).toBeTruthy();
    expect(getByTestId('request-details-location-val')).toHaveTextContent(
      'شمال غرب صليبيخات',
    );

    expect(getByText('الميزانية')).toBeTruthy();
    expect(getByTestId('request-details-price-val')).toHaveTextContent(
      '22,000 - 15,000 د.ك',
    );

    expect(getByText('تاريخ النشر')).toBeTruthy();
    expect(getByTestId('request-details-publish-time-val')).toBeTruthy();

    expect(getByText('العروض')).toBeTruthy();
    expect(getByTestId('request-details-offer-type-val')).toHaveTextContent(
      'عرض مخصص',
    );
  });

  it('renders attached photos gallery with +extra count indicator', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByText('الصور المرفقة')).toBeTruthy();
    expect(getByTestId('request-details-photo-0')).toBeTruthy();
    expect(getByTestId('request-details-photo-1')).toBeTruthy();
    expect(getByTestId('request-details-photo-2')).toBeTruthy();
    expect(getByTestId('request-details-photo-extra-count')).toHaveTextContent(
      '+1',
    );
  });

  it('renders request description section', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByText('الوصف')).toBeTruthy();
    expect(getByTestId('request-details-description-body')).toBeTruthy();
  });

  it('renders map preview and handles maximize press', async () => {
    const { getByTestId, getByText } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByText('الموقع على الخريطة')).toBeTruthy();
    expect(getByTestId('request-details-map-container')).toBeTruthy();

    await fireEvent.press(getByTestId('request-details-map-maximize-btn'));
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('renders client card with name, metadata, rating, and starts a real chat on the chat/reply triggers', async () => {
    (chatService.createConversation as jest.Mock).mockResolvedValue({ id: 'conv-1' });
    (companyRequestsService.markResponded as jest.Mock).mockResolvedValue({});

    const { getByTestId } = await render(<CompanyRequestDetailsScreen />);

    expect(getByTestId('request-details-client-name')).toHaveTextContent(
      'نواف الجارحي',
    );
    expect(getByTestId('request-details-client-meta')).toHaveTextContent(
      'مضيف منذ 6/2026 • 5 عروض سابقة',
    );
    expect(getByTestId('request-details-client-rating')).toHaveTextContent('3.5');

    await fireEvent.press(getByTestId('request-details-chat-button'));
    expect(chatService.createConversation).toHaveBeenCalledWith(
      'client-1',
      undefined,
      'req-1',
    );
    expect(companyRequestsService.markResponded).toHaveBeenCalledWith('req-1');
    expect(mockPush).toHaveBeenCalledWith('/chat/conv-1');

    await fireEvent.press(getByTestId('request-details-call-button'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+96590000000');

    // An independent button, not a repeat tap of the same one -- clear the
    // openUrlThrottled burst lock so the WhatsApp open is not swallowed as
    // a double-tap.
    resetLinkThrottle();

    await fireEvent.press(getByTestId('request-details-whatsapp-button'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://wa.me/+96590000000');
  });

  it('accepts a request via the real endpoint on confirmation', async () => {
    (companyRequestsService.accept as jest.Mock).mockResolvedValue({});

    const { getByTestId } = await render(<CompanyRequestDetailsScreen />);

    await fireEvent.press(getByTestId('request-details-accept-button'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'قبول الطلب',
      expect.stringContaining('هل أنت متأكد من رغبتك في قبول طلب:'),
      expect.any(Array),
    );

    const confirmAction = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await confirmAction.onPress();
    expect(companyRequestsService.accept).toHaveBeenCalledWith('req-1');
  });

  it('rejects a request via the real endpoint on confirmation, only for company-scoped requests', async () => {
    (companyRequestsService.reject as jest.Mock).mockResolvedValue({});

    const { getByTestId, queryByTestId, rerender } = await render(
      <CompanyRequestDetailsScreen />,
    );

    await fireEvent.press(getByTestId('request-details-reject-button'));
    const confirmAction = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await confirmAction.onPress();
    expect(companyRequestsService.reject).toHaveBeenCalledWith('req-1');

    mockDetails({ scope: 'public' });
    await rerender(<CompanyRequestDetailsScreen />);
    expect(queryByTestId('request-details-reject-button')).toBeNull();
  });
});
