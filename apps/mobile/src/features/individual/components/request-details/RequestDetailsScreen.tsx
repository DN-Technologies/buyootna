import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WarningTriangleIcon } from '@/assets/icons/activity';
import type { RequestOffer } from '@/features/company/components/requests/types';
import ActivitySuccessToast from '@/features/individual/components/activity/ActivitySuccessToast';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ReplyDetailsSheet from '@/features/individual/components/request-details/ReplyDetailsSheet';
import RequestActionBar from '@/features/individual/components/request-details/RequestActionBar';
import RequestDetailsBody, {
  shownOffers,
} from '@/features/individual/components/request-details/RequestDetailsBody';
import RequestDetailsHeader from '@/features/individual/components/request-details/RequestDetailsHeader';
import { useActivityToast } from '@/features/individual/hooks/useActivityToast';
import { useRequestDetails } from '@/features/individual/hooks/useRequestDetails';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import RequestDetailsSkeleton from '@/shared/components/skeletons/RequestDetailsSkeleton';
import { showAlert } from '@/shared/utils/alert';
import { formatNumber } from '@/shared/utils/formatNumber';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import { openChatWith } from '@/shared/utils/openChat';

/** تفاصيل العرض -- one request the user sent (Figma: pending / replied / rejected). */
export default function RequestDetailsScreen({ id }: { id?: string }) {
  const { request, isLoading, error, refetch } = useRequestDetails(id);
  const { showToast, toastMessage, toastSubtitle, fadeAnim, slideAnim, triggerToast } =
    useActivityToast();

  const replySheetRef = useRef<BottomSheetModal>(null);
  const acceptSheetRef = useRef<BottomSheetModal>(null);
  const rejectSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetRef = useRef<BottomSheetModal>(null);

  const [selectedOffer, setSelectedOffer] = useState<RequestOffer | undefined>();
  // The company whose offer is being accepted or rejected
  const [decidingOffer, setDecidingOffer] = useState<RequestOffer | undefined>();

  const openChat = (providerId: string) =>
    openChatWith(router, { recipientId: providerId, requestId: request?.id });

  const offers = request ? shownOffers(request) : [];
  const singleProvider = offers[0]?.provider ?? request?.provider ?? undefined;
  // A request answered before offers existed has only its company
  const singleOffer: RequestOffer | undefined =
    offers[0] ??
    (singleProvider ? { id: request!.id, provider: singleProvider } : undefined);

  const isSingleReply =
    !!request &&
    request.status === 'responded' &&
    offers.length <= 1 &&
    !!singleProvider;

  // Real offers only: the stand-in above has no offer id to send
  const offerIdOf = (offer?: RequestOffer) =>
    offer && request?.offers?.some((o) => o.id === offer.id)
      ? offer.id
      : undefined;

  // Only an open request (waiting or answered) can still be deleted
  const canDelete =
    !!request && (request.status === 'pending' || request.status === 'responded');

  const decide = (offer: RequestOffer | undefined, sheet: 'accept' | 'reject') => {
    if (!offer) return;
    setDecidingOffer(offer);
    replySheetRef.current?.dismiss();
    (sheet === 'accept' ? acceptSheetRef : rejectSheetRef).current?.present();
  };

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      return true;
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, failure));
      return false;
    }
  };

  const handleConfirmAccept = async () => {
    if (!request) return;
    if (
      await run(() => companyRequestsService.acceptOffer(request.id, offerIdOf(decidingOffer)), 'فشل في قبول العرض')
    ) {
      triggerToast('تم قبول العرض بنجاح');
    }
    refetch();
  };

  const handleConfirmReject = async () => {
    if (!request) return;
    await run(() => companyRequestsService.rejectOffer(request.id, offerIdOf(decidingOffer)), 'فشل في رفض العرض');
    refetch();
  };

  const handleConfirmDelete = async () => {
    if (!request) return;
    if (await run(() => companyRequestsService.remove(request.id), 'فشل في حذف الطلب')) {
      router.back();
    }
  };

  const providerName = decidingOffer?.provider.name ?? '';
  const priceText =
    decidingOffer?.price != null ? ` مقابل ${formatNumber(decidingOffer.price)} د.ك` : '';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <RequestDetailsHeader
        onBack={() => router.back()}
        onDelete={canDelete ? () => deleteSheetRef.current?.present() : undefined}
      />

      {!request ? (
        isLoading ? (
          <RequestDetailsSkeleton />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <Text
              testID="request-details-error"
              className="text-center font-cairo-medium text-[14px] text-[#6B6A6A]"
            >
              {error ?? 'الطلب غير موجود'}
            </Text>
          </View>
        )
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#15304D" />
          }
        >
          <RequestDetailsBody
            request={request}
            onChatPress={openChat}
            onOfferDetailsPress={(offer) => {
              setSelectedOffer(offer);
              replySheetRef.current?.present();
            }}
          />
        </ScrollView>
      )}

      {isSingleReply && (
        <RequestActionBar
          onAccept={() => decide(singleOffer, 'accept')}
          onReject={() => decide(singleOffer, 'reject')}
        />
      )}

      <ReplyDetailsSheet
        ref={replySheetRef}
        offer={selectedOffer}
        onClose={() => setSelectedOffer(undefined)}
        onChatPress={(offer) => openChat(offer.provider.id)}
        onAccept={(offer) => decide(offer, 'accept')}
        onReject={(offer) => decide(offer, 'reject')}
      />

      <ConfirmActionSheet
        ref={acceptSheetRef}
        title="هل انت متأكد من قبول العرض ؟"
        description={`سيتم قبول عرض شركة “${providerName}”${priceText}، وسيتم مشاركة معلومات التواصل مع الشركة بعد تأكيد القبول.`}
        confirmLabel="تأكيد القبول"
        onConfirm={handleConfirmAccept}
      />

      <ConfirmActionSheet
        ref={rejectSheetRef}
        variant="danger"
        icon={<WarningTriangleIcon />}
        iconBackground="#F9FAFE"
        title={`هل انت متأكد من رفض عرض شركة ${providerName}؟`}
        description="لن تتمكن من قبول هذا العرض أو استعادة بياناته مجدداً."
        confirmLabel="رفض العرض"
        onConfirm={handleConfirmReject}
      />

      <ConfirmActionSheet
        ref={deleteSheetRef}
        variant="danger"
        icon={<WarningTriangleIcon />}
        iconBackground="#FFEBEB"
        title={`هل انت متأكد من حذف عرض ${request?.title ?? ''}؟`}
        description="بحذف العرض ستفقد جميع الداتا، لن تتمكن من الوصول لهذا العرض مجددا واستقبال أي ردود."
        confirmLabel="تأكيد الحذف"
        onConfirm={handleConfirmDelete}
      />

      <ActivitySuccessToast
        visible={showToast}
        message={toastMessage}
        subtitle={toastSubtitle}
        bottomOffset={40}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />
    </SafeAreaView>
  );
}
