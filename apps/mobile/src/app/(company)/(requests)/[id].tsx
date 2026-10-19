import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WarningTriangleIcon } from '@/assets/icons/activity';
import {
  RequestDetailsAttachments,
  RequestDetailsBottomBar,
  RequestDetailsClientCard,
  RequestDetailsDescription,
  RequestDetailsHeader,
  RequestDetailsInfoGrid,
  RequestDetailsMap,
  RequestDetailsReplySection,
  RequestDetailsTitleCard,
  RequestOptionsMenu,
} from '@/features/company/components/requests';
import { useCompanyRequestDetails } from '@/features/company/hooks/useCompanyRequestDetails';
import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { formatDetails } from '@/shared/components/map/picker/addressParsing';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { useChatReport } from '@/shared/hooks/chat/useChatReport';
import { showAlert } from '@/shared/utils/alert';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

function formatJoinedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return `مضيف منذ ${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function CompanyRequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: request, isLoading, refetch } = useCompanyRequestDetails(id);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(company)/company-requests');
    }
  };

  const queryClient = useQueryClient();
  const acceptSheetRef = useRef<BottomSheetModal>(null);
  const rejectSheetRef = useRef<BottomSheetModal>(null);
  const endSheetRef = useRef<BottomSheetModal>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const saved = isSaved ?? request?.isSaved ?? false;
  const { reportSheetRef, handleReportUser, handleSubmitReport } =
    useChatReport(request?.client?.userId);

  const errorText = (error: any) => {
    const backendMsg = error?.response?.data?.message;
    return Array.isArray(backendMsg)
      ? backendMsg.join('\n')
      : backendMsg || 'حدث خطأ ما';
  };

  const refreshLists = () =>
    queryClient.invalidateQueries({ queryKey: ['companyRequests'] });

  const handleConfirmAccept = async () => {
    if (!request) return;
    try {
      await companyRequestsService.accept(request.id);
      await refetch();
      refreshLists();
      showAlert('تم القبول', 'تم قبول الطلب بنجاح وإشعار العميل.');
    } catch (error: any) {
      if (handleSubscriptionRequired(error, router)) return;
      showAlert('تعذر القبول', errorText(error));
    }
  };

  // A public request leaves only this company's lists (shown under مرفوضة)
  const handleConfirmReject = async () => {
    if (!request) return;
    try {
      await companyRequestsService.reject(request.id);
      refreshLists();
      handleBack();
    } catch (error: any) {
      showAlert('تعذر الرفض', errorText(error));
    }
  };

  // اضافة الى المفضلة / إزالة من المفضلة, shown at once
  const handleToggleSave = async () => {
    if (!request) return;
    const next = !saved;
    setIsSaved(next);
    try {
      if (next) await companyRequestsService.bookmark(request.id);
      else await companyRequestsService.unbookmark(request.id);
      refreshLists();
    } catch (error: any) {
      setIsSaved(!next);
      showAlert('تعذر الحفظ', errorText(error));
    }
  };

  const handleChat = async () => {
    if (!request) return;
    try {
      const conversation = await chatService.createConversation(
        request.clientIdentityId,
        undefined,
        // The chat is about this request: both sides see it pinned
        request.id,
      );
      await companyRequestsService.markResponded(request.id);
      refetch();
      router.push(`/chat/${conversation.id}` as any);
    } catch (error: any) {
      const backendMsg = error?.response?.data?.message;
      const msg = Array.isArray(backendMsg)
        ? backendMsg.join('\n')
        : backendMsg || 'تعذر بدء المحادثة مع العميل';
      showAlert('تنبيه', msg);
    }
  };

  const handlePhotoPress = (index: number) => {
    Alert.alert('معاينة الصورة', `عرض الصورة رقم ${index + 1} بالحجم الكامل`);
  };

  if (isLoading || !request) {
    return <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      {/* 1. Header with Back Button & Options (none once rejected) */}
      <RequestDetailsHeader
        title="تفاصيل الطلب"
        onBackPress={handleBack}
        onOptionsPress={
          request.status === 'rejected' ? undefined : () => setMenuOpen(true)
        }
      />

      {/* 2. Scrollable Body Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        {/* Title & Status Badge */}
        <RequestDetailsTitleCard
          title={request.title}
          requestNumber={request.requestNumber}
          category={request.category}
          status={request.status}
        />

        {/* 2x2 Key Info Grid */}
        <RequestDetailsInfoGrid
          location={request.location}
          priceRange={request.priceRange}
          publishTime={formatTimeAgo(request.createdAt)}
          offersCount={request.offersCount ?? request.offers?.length ?? 0}
        />

        {/* Attached Photos Gallery */}
        <RequestDetailsAttachments
          images={request.images}
          totalAttachmentsCount={request.attachmentsCount}
          onPhotoPress={handlePhotoPress}
        />

        {/* Request Description */}
        <RequestDetailsDescription description={request.description} />

        {/* Location on Map */}
        <RequestDetailsMap
          location={
            request.addressDetails
              ? `${request.location} — ${formatDetails(request.addressDetails)}`
              : request.location
          }
          latitude={request.latitude}
          longitude={request.longitude}
        />

        {/* Client Profile Card */}
        <RequestDetailsClientCard
          client={
            request.client
              ? { ...request.client, joinedDate: formatJoinedDate(request.client.joinedDate) }
              : undefined
          }
          onChatPress={handleChat}
        />

        {/* تفاصيل الرد: the company's own offer */}
        <RequestDetailsReplySection reply={request.offers?.[0]?.reply} />
      </ScrollView>

      {/* 3. Sticky actions by status (Figma): قيد الانتظار قبول / رفض;
          مقبولة اصدار فاتورة / انهاء الطلب until it's ended; none otherwise */}
      {request.status === 'pending' && (
        <RequestDetailsBottomBar
          onAcceptPress={() => acceptSheetRef.current?.present()}
          onRejectPress={() => rejectSheetRef.current?.present()}
        />
      )}
      {request.status === 'accepted' && !request.completed && (
        <RequestDetailsBottomBar
          variant="accepted"
          onInvoicePress={() =>
            router.push({
              pathname: '/create-invoice',
              params: { requestId: request.id, clientName: request.clientName },
            } as never)
          }
          onEndPress={() => endSheetRef.current?.present()}
        />
      )}

      <RequestOptionsMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isSaved={saved}
        onToggleSave={handleToggleSave}
        onReport={request.client?.userId ? handleReportUser : undefined}
      />

      <ConfirmActionSheet
        ref={acceptSheetRef}
        title="هل أنت متأكد من قبول هذا الطلب؟"
        description="سيتم إشعار العميل بقبولك للطلب."
        confirmLabel="تأكيد القبول"
        onConfirm={handleConfirmAccept}
      />

      {/* Figma 4410:165291 */}
      <ConfirmActionSheet
        ref={rejectSheetRef}
        variant="danger"
        icon={<WarningTriangleIcon color="#15304D" />}
        iconBackground="#F9FAFE"
        title="هل أنت متأكد من رفض هذا الطلب؟"
        description="لن يظهر مرة أخرى ضمن طلباتك."
        confirmLabel="تأكيد الرفض"
        onConfirm={handleConfirmReject}
      />

      {/* Figma 7432:129312 */}
      <ConfirmActionSheet
        ref={endSheetRef}
        variant="danger"
        icon={<WarningTriangleIcon color="#15304D" />}
        iconBackground="#F9FAFE"
        title="إنهاء الطلب"
        description="هل انتهى التعامل مع العميل؟ يمكنك إنهاء الطلب وإخراجه من قائمة الطلبات المقبولة.لن يظهر الطلب ضمن طلباتك المقبولة."
        confirmLabel="نعم، انتهى"
        cancelLabel="لا، مازال مستمرًا"
        onConfirm={() =>
          router.push(`/(company)/(requests)/end/${request.id}` as never)
        }
      />

      <ReportReasonSheet ref={reportSheetRef} onSubmit={handleSubmitReport} />
    </SafeAreaView>
  );
}
