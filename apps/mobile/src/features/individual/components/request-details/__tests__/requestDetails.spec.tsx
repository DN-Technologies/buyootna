import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import type { CompanyRequestItem } from '@/features/company/components/requests/types';

import ReplyDetailsSheet from '../ReplyDetailsSheet';
import RequestDetailsBody, { shownOffers } from '../RequestDetailsBody';
import RequestDetailsHeader from '../RequestDetailsHeader';
import RequestDetailsScreen from '../RequestDetailsScreen';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View {...props} /> };
});
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const Modal = React.forwardRef(({ children }: any, _ref: any) => <>{children}</>);
  Modal.displayName = 'BottomSheetModal';
  return {
    BottomSheetModal: Modal,
    BottomSheetView: ({ children }: any) => <>{children}</>,
    BottomSheetBackdrop: () => null,
  };
});

const provider = {
  id: 'p1',
  name: 'شركة اركان',
  logoUrl: null,
  specialty: 'للاستشارات الهندسية والتصميم',
  isVerified: true,
};
const reply = {
  message: 'مرحبا استاذ علي نحن مستعدون لتنفيذ الفحص',
  notes: 'يمكن تحديد موعد المعاينة خلال 24 ساعة',
};

const make = (over: Partial<CompanyRequestItem> = {}): CompanyRequestItem => ({
  id: 'r1',
  clientIdentityId: 'c1',
  title: 'فحص هندسي لعقار بالسالمية',
  clientName: 'أنا',
  requestNumber: '#A1B2C3',
  category: 'فحص هندسي',
  priceRange: '150,000 - 200,000 د.ك',
  location: 'السالمية',
  attachmentsCount: 3,
  images: ['https://x/1.jpg', 'https://x/2.jpg', 'https://x/3.jpg'],
  description: 'أحتاج فحص هندسي كامل قبل شراء العقار',
  status: 'pending',
  scope: 'public',
  createdAt: '2026-05-19T00:00:00.000Z',
  updatedAt: '2026-05-19T00:00:00.000Z',
  ...over,
});

const mockUseRequestDetails = jest.fn();
jest.mock('@/features/individual/hooks/useRequestDetails', () => ({
  useRequestDetails: (id?: string) => mockUseRequestDetails(id),
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

const noop = () => undefined;

describe('RequestDetailsHeader', () => {
  it('shows the delete button only when the request can be deleted', async () => {
    const { queryByTestId, rerender } = await render(
      <RequestDetailsHeader onBack={noop} />,
    );
    expect(queryByTestId('request-details-delete')).toBeNull();

    await rerender(<RequestDetailsHeader onBack={noop} onDelete={noop} />);
    expect(queryByTestId('request-details-delete')).toBeTruthy();
  });

  it('goes back', async () => {
    const onBack = jest.fn();
    const { getByTestId } = await render(<RequestDetailsHeader onBack={onBack} />);
    await fireEvent.press(getByTestId('request-details-back'));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('RequestDetailsBody', () => {
  it('pending: status tag, the request facts and attachments, no company', async () => {
    const { getByText, getByTestId, queryByTestId, queryByText } = await render(
      <RequestDetailsBody request={make()} onChatPress={noop} onOfferDetailsPress={noop} />,
    );

    expect(getByText('قيد الانتظار')).toBeTruthy();
    expect(getByText(/اخر تحديث/)).toBeTruthy();
    expect(getByTestId('request-info-number').props.children).toBe('#A1B2C3');
    expect(getByText('150,000 - 200,000 د.ك')).toBeTruthy();
    expect(getByText('فحص هندسي')).toBeTruthy();
    expect(getByTestId('request-description')).toBeTruthy();
    expect(getByTestId('request-attachment-2')).toBeTruthy();
    expect(queryByTestId('provider-name')).toBeNull();
    expect(queryByText('تفاصيل رد الشركة')).toBeNull();
  });

  it('replied by one company: its card, chat and reply, then the request section', async () => {
    const onChatPress = jest.fn();
    const { getByText, getByTestId } = await render(
      <RequestDetailsBody
        request={make({ status: 'responded', provider, offers: [{ id: 'o1', provider, status: 'sent', reply }] })}
        onChatPress={onChatPress}
        onOfferDetailsPress={noop}
      />,
    );

    expect(getByTestId('provider-name').props.children).toBe('شركة اركان');
    expect(getByText('تفاصيل رد الشركة')).toBeTruthy();
    expect(getByText(reply.notes)).toBeTruthy();
    expect(getByText('تفاصيل الطلب')).toBeTruthy();
    expect(getByText('تم الرد')).toBeTruthy();

    await fireEvent.press(getByTestId('provider-chat'));
    expect(onChatPress).toHaveBeenCalledWith('p1');
  });

  it('several offers: العروض with a count, التفاصيل opens the offer, الرد chats', async () => {
    const offers = [
      { id: 'o1', provider },
      { id: 'o2', provider: { ...provider, id: 'p2', name: 'شركة البنيان' } },
    ];
    const onOfferDetailsPress = jest.fn();
    const onChatPress = jest.fn();
    const { getByText, getByTestId } = await render(
      <RequestDetailsBody
        request={make({ status: 'responded', offers })}
        onChatPress={onChatPress}
        onOfferDetailsPress={onOfferDetailsPress}
      />,
    );

    expect(getByText('العروض')).toBeTruthy();
    expect(getByText('2 عروض')).toBeTruthy();

    await fireEvent.press(getByTestId('offer-details-o2'));
    expect(onOfferDetailsPress).toHaveBeenCalledWith(offers[1]);
    await fireEvent.press(getByTestId('offer-reply-o1'));
    expect(onChatPress).toHaveBeenCalledWith('p1');
  });

  it('rejected: مرفوضة on top, the company reply, and the section stays تم الرد', async () => {
    const { getAllByTestId, getByText } = await render(
      <RequestDetailsBody
        request={make({ status: 'rejected', provider, offers: [{ id: 'o1', provider, status: 'rejected', reply }] })}
        onChatPress={noop}
        onOfferDetailsPress={noop}
      />,
    );

    expect(getByText('مرفوضة')).toBeTruthy();
    expect(getByText('تفاصيل رد الشركة')).toBeTruthy();
    expect(getByText('تم الرد')).toBeTruthy();
    expect(getAllByTestId('request-status-badge')).toHaveLength(2);
  });
});

describe('ReplyDetailsSheet', () => {
  const offer = { id: 'o1', provider, reply };

  it('titles the sheet with the company and offers قبول العرض / رفض', async () => {
    const ref = createRef<any>();
    const onAccept = jest.fn();
    const onReject = jest.fn();
    const { getByTestId, getByText } = await render(
      <ReplyDetailsSheet
        ref={ref}
        offer={offer}
        onClose={noop}
        onChatPress={noop}
        onAccept={onAccept}
        onReject={onReject}
      />,
    );

    expect(getByTestId('reply-sheet-title').props.children).toEqual([
      'تفاصيل رد ',
      'شركة اركان',
    ]);
    expect(getByText(reply.message)).toBeTruthy();

    await fireEvent.press(getByTestId('reply-sheet-accept'));
    expect(onAccept).toHaveBeenCalledWith(offer);
    await fireEvent.press(getByTestId('reply-sheet-reject'));
    expect(onReject).toHaveBeenCalledWith(offer);
  });
});

describe('RequestDetailsScreen loading', () => {
  it('shows a skeleton, not a spinner, while the request loads', async () => {
    mockUseRequestDetails.mockReturnValue({
      request: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { getByTestId, queryByTestId } = await render(
      <RequestDetailsScreen id="r1" />,
    );
    expect(getByTestId('request-details-skeleton')).toBeTruthy();
    expect(queryByTestId('request-details-error')).toBeNull();
  });

  it('shows the error once loading failed', async () => {
    mockUseRequestDetails.mockReturnValue({
      request: undefined,
      isLoading: false,
      error: 'الطلب غير موجود',
      refetch: jest.fn(),
    });
    const { getByTestId, queryByTestId } = await render(
      <RequestDetailsScreen id="r1" />,
    );
    expect(getByTestId('request-details-error')).toBeTruthy();
    expect(queryByTestId('request-details-skeleton')).toBeNull();
  });
});

describe('shownOffers', () => {
  const offers = [
    { id: 'o1', provider, status: 'sent' as const },
    { id: 'o2', provider, status: 'rejected' as const },
    { id: 'o3', provider, status: 'accepted' as const },
  ];

  it('hides rejected offers while replied, shows only the accepted one once accepted', () => {
    expect(shownOffers(make({ status: 'responded', offers })).map((o) => o.id)).toEqual(['o1', 'o3']);
    expect(shownOffers(make({ status: 'accepted', offers })).map((o) => o.id)).toEqual(['o3']);
    expect(shownOffers(make({ status: 'rejected', offers })).map((o) => o.id)).toEqual(['o1', 'o2', 'o3']);
  });
});
