/* eslint-disable @typescript-eslint/no-require-imports */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { CompanyRequestItem } from '@/features/company/components/requests';
import { useCompanyRequestDetails } from '@/features/company/hooks/useCompanyRequestDetails';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { reportsService } from '@/shared/api/reports.service';
import { resetLinkThrottle } from '@/shared/utils/openUrl';

import RequestDetailsScreen from '../(requests)/[id]';

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
    respond: jest.fn(),
    bookmark: jest.fn(),
    unbookmark: jest.fn(),
  },
}));

jest.mock('@/shared/api/reports.service', () => ({
  reportsService: { submitReport: jest.fn() },
}));

jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

// The screen invalidates the request lists after acting
function CompanyRequestDetailsScreen() {
  const [client] = require('react').useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <RequestDetailsScreen />
    </QueryClientProvider>
  );
}
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
  offersCount: 2,
  client: {
    userId: 'user-client-1',
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
    // العروض: how many offers, not the offer type
    expect(getByTestId('request-details-offer-type-val')).toHaveTextContent(
      '2 عروض',
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
    // Opening a chat is not a reply: the status is left alone (QA: تم الرد
    // showed without replying)
    expect(companyRequestsService.respond).not.toHaveBeenCalled();
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

  it('accepts a request after the confirmation sheet', async () => {
    (companyRequestsService.accept as jest.Mock).mockResolvedValue({});
    const { present } = require('@gorhom/bottom-sheet');

    const { getByTestId, getByText } = await render(<CompanyRequestDetailsScreen />);

    await fireEvent.press(getByTestId('request-details-accept-button'));
    expect(present).toHaveBeenCalled();
    expect(getByText('هل أنت متأكد من قبول هذا الطلب؟')).toBeTruthy();

    await fireEvent.press(getByText('تأكيد القبول'));
    await waitFor(() =>
      expect(companyRequestsService.accept).toHaveBeenCalledWith('req-1'),
    );
  });

  it('rejects after «هل أنت متأكد من رفض هذا الطلب؟», then goes back; public requests too', async () => {
    (companyRequestsService.reject as jest.Mock).mockResolvedValue({});
    mockDetails({ scope: 'public' });

    const { getByTestId, getByText } = await render(<CompanyRequestDetailsScreen />);

    // Rejecting a public request hides it for this company only
    expect(getByTestId('request-details-reject-button')).toBeTruthy();
    await fireEvent.press(getByTestId('request-details-reject-button'));
    expect(getByText('هل أنت متأكد من رفض هذا الطلب؟')).toBeTruthy();
    expect(getByText('لن يظهر مرة أخرى ضمن طلباتك.')).toBeTruthy();

    await fireEvent.press(getByText('تأكيد الرفض'));
    await waitFor(() =>
      expect(companyRequestsService.reject).toHaveBeenCalledWith('req-1'),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('no قبول / رفض once the request is closed', async () => {
    mockDetails({ status: 'rejected' });
    const { queryByTestId } = await render(<CompanyRequestDetailsScreen />);

    expect(queryByTestId('request-details-accept-button')).toBeNull();
    expect(queryByTestId('request-details-reject-button')).toBeNull();
  });

  it('⋮ › اضافة الى المفضلة saves the request; once saved it offers إزالة', async () => {
    (companyRequestsService.bookmark as jest.Mock).mockResolvedValue(undefined);
    (companyRequestsService.unbookmark as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId, queryByTestId } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(queryByTestId('request-options-save')).toBeNull();
    await fireEvent.press(getByTestId('request-details-options-button'));
    expect(getByTestId('request-options-save')).toHaveTextContent(
      'اضافة الى المفضلة',
    );
    await fireEvent.press(getByTestId('request-options-save'));
    expect(companyRequestsService.bookmark).toHaveBeenCalledWith('req-1');

    await fireEvent.press(getByTestId('request-details-options-button'));
    expect(getByTestId('request-options-save')).toHaveTextContent(
      'إزالة من المفضلة',
    );
    await fireEvent.press(getByTestId('request-options-save'));
    expect(companyRequestsService.unbookmark).toHaveBeenCalledWith('req-1');
  });

  it('⋮ › الإبلاغ عن المستخدم reports the client', async () => {
    (reportsService.submitReport as jest.Mock).mockResolvedValue(undefined);
    const { getByTestId, getByText } = await render(<CompanyRequestDetailsScreen />);

    await fireEvent.press(getByTestId('request-details-options-button'));
    await fireEvent.press(getByTestId('request-options-report'));

    await fireEvent.press(getByText('احتيال أو نصب'));
    await fireEvent.press(getByText('إرسال البلاغ'));
    await waitFor(() =>
      expect(reportsService.submitReport).toHaveBeenCalledWith(
        'user-client-1',
        'احتيال أو نصب',
        undefined,
      ),
    );
  });

  it('a client without a rating or a photo still renders', async () => {
    mockDetails({
      client: { ...BASE_REQUEST.client!, rating: null, avatarUrl: undefined },
    });
    const { getByTestId, queryByTestId } = await render(
      <CompanyRequestDetailsScreen />,
    );

    expect(getByTestId('request-details-client-name')).toHaveTextContent(
      'نواف الجارحي',
    );
    expect(queryByTestId('request-details-client-rating')).toBeNull();
  });

  it('مقبولة: اصدار فاتورة opens the invoice for this client', async () => {
    mockDetails({ status: 'accepted' });
    const { getByTestId, queryByTestId } = await render(<CompanyRequestDetailsScreen />);

    expect(queryByTestId('request-details-accept-button')).toBeNull();
    await fireEvent.press(getByTestId('request-details-invoice-button'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/create-invoice',
      params: { requestId: 'req-1', clientName: 'نواف الجارحي' },
    });
  });

  it('مقبولة: انهاء الطلب asks, then opens the end screen', async () => {
    mockDetails({ status: 'accepted' });
    const { getByTestId, getByText } = await render(<CompanyRequestDetailsScreen />);

    await fireEvent.press(getByTestId('request-details-end-button'));
    expect(getByText('لا، مازال مستمرًا')).toBeTruthy();
    await fireEvent.press(getByText('نعم، انتهى'));
    expect(mockPush).toHaveBeenCalledWith('/(company)/(requests)/end/req-1');
  });

  it('an ended request has no actions', async () => {
    mockDetails({ status: 'accepted', completed: true });
    const { queryByTestId } = await render(<CompanyRequestDetailsScreen />);
    expect(queryByTestId('request-details-end-button')).toBeNull();
    expect(queryByTestId('request-details-invoice-button')).toBeNull();
  });

  it('تم الرد: تفاصيل الرد, no actions', async () => {
    mockDetails({
      status: 'responded',
      offers: [
        {
          id: 'o1',
          provider: {
            id: 'company-1',
            name: 'شركة',
            logoUrl: null,
            specialty: null,
            isVerified: true,
          },
          reply: { message: 'فحص إنشائي', excludes: 'اختبار التربة', notes: null },
        },
      ],
    });
    const { getByTestId, queryByTestId } = await render(<CompanyRequestDetailsScreen />);

    expect(getByTestId('request-details-reply-includes')).toHaveTextContent('فحص إنشائي');
    expect(getByTestId('request-details-reply-excludes')).toHaveTextContent('اختبار التربة');
    expect(queryByTestId('request-details-reply-notes')).toBeNull();
    expect(queryByTestId('request-details-accept-button')).toBeNull();
    expect(queryByTestId('request-details-end-button')).toBeNull();
  });

  it('مرفوضة: no ⋮', async () => {
    mockDetails({ status: 'rejected' });
    const { queryByTestId } = await render(<CompanyRequestDetailsScreen />);
    expect(queryByTestId('request-details-options-button')).toBeNull();
  });
});
