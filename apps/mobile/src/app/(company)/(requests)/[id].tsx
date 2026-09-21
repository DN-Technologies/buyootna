import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RequestDetailsAttachments,
  RequestDetailsBottomBar,
  RequestDetailsClientCard,
  RequestDetailsDescription,
  RequestDetailsHeader,
  RequestDetailsInfoGrid,
  RequestDetailsMap,
  RequestDetailsTitleCard,
} from '@/features/company/components/requests';
import { useCompanyRequestDetails } from '@/features/company/hooks/useCompanyRequestDetails';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
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

  const handleOptions = () => {
    Alert.alert('خيارات الطلب', 'خيارات إضافية لمشاركة أو الإبلاغ عن الطلب');
  };

  const handleAccept = () => {
    if (!request) return;
    Alert.alert(
      'قبول الطلب',
      `هل أنت متأكد من رغبتك في قبول طلب: "${request.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد القبول',
          style: 'default',
          onPress: async () => {
            try {
              await companyRequestsService.accept(request.id);
              await refetch();
              showAlert('تم القبول', 'تم قبول الطلب بنجاح وإشعار العميل.');
            } catch (error: any) {
              const backendMsg = error?.response?.data?.message;
              showAlert(
                'تعذر القبول',
                Array.isArray(backendMsg) ? backendMsg.join('\n') : backendMsg || 'حدث خطأ ما',
              );
            }
          },
        },
      ],
    );
  };

  const handleReject = () => {
    if (!request) return;
    Alert.alert(
      'رفض الطلب',
      `هل أنت متأكد من رغبتك في رفض طلب: "${request.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد الرفض',
          style: 'destructive',
          onPress: async () => {
            try {
              await companyRequestsService.reject(request.id);
              await refetch();
              showAlert('تم الرفض', 'تم رفض الطلب بنجاح.');
            } catch (error: any) {
              const backendMsg = error?.response?.data?.message;
              showAlert(
                'تعذر الرفض',
                Array.isArray(backendMsg) ? backendMsg.join('\n') : backendMsg || 'حدث خطأ ما',
              );
            }
          },
        },
      ],
    );
  };

  const handleChat = async () => {
    if (!request) return;
    try {
      const conversation = await chatService.createConversation(
        request.clientIdentityId,
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
      {/* 1. Header with Back Button & Options */}
      <RequestDetailsHeader
        title="تفاصيل الطلب"
        onBackPress={handleBack}
        onOptionsPress={handleOptions}
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
          offerType={request.offerType}
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
          location={request.location}
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
      </ScrollView>

      {/* 3. Sticky Bottom Action Buttons */}
      <RequestDetailsBottomBar
        onAcceptPress={handleAccept}
        onRejectPress={handleReject}
        showReject={request.scope === 'company'}
      />
    </SafeAreaView>
  );
}
