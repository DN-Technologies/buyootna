import { fireEvent, render } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

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

jest.spyOn(Alert, 'alert');
jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);

describe('CompanyRequestDetailsScreen (Figma Design Implementation 4410:164934)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const backBtn = getByTestId('request-details-back-button');
    await fireEvent.press(backBtn);
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
    expect(getByTestId('request-details-publish-time-val')).toHaveTextContent(
      'منذ ساعتين',
    );

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

    const maxBtn = getByTestId('request-details-map-maximize-btn');
    await fireEvent.press(maxBtn);
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('renders client card with name, metadata, rating, and contact triggers', async () => {
    const { getByTestId } = await render(<CompanyRequestDetailsScreen />);

    expect(getByTestId('request-details-client-name')).toHaveTextContent(
      'نواف الجارحي',
    );
    expect(getByTestId('request-details-client-meta')).toHaveTextContent(
      'مضيف منذ 06/2026 • 5 عروض سابقة',
    );
    expect(getByTestId('request-details-client-rating')).toHaveTextContent('3.5');

    // Chat trigger
    const chatBtn = getByTestId('request-details-chat-button');
    await fireEvent.press(chatBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      'بدء المحادثة',
      expect.stringContaining('نواف الجارحي'),
    );

    // Call trigger
    const callBtn = getByTestId('request-details-call-button');
    await fireEvent.press(callBtn);
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+96590000000');

    // WhatsApp trigger
    const waBtn = getByTestId('request-details-whatsapp-button');
    await fireEvent.press(waBtn);
    expect(Linking.openURL).toHaveBeenCalledWith('https://wa.me/+96590000000');
  });

  it('triggers confirmation alerts when accepting or rejecting request', async () => {
    const { getByTestId } = await render(<CompanyRequestDetailsScreen />);

    // Accept button
    const acceptBtn = getByTestId('request-details-accept-button');
    await fireEvent.press(acceptBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      'قبول الطلب',
      expect.stringContaining('هل أنت متأكد من رغبتك في قبول طلب:'),
      expect.any(Array),
    );

    // Reject button
    const rejectBtn = getByTestId('request-details-reject-button');
    await fireEvent.press(rejectBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      'رفض الطلب',
      expect.stringContaining('هل أنت متأكد من رغبتك في رفض طلب:'),
      expect.any(Array),
    );
  });
});
