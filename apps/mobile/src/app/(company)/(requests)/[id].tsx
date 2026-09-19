import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MOCK_COMPANY_REQUESTS,
  MOCK_REQUEST_DETAILS,
  RequestDetailsAttachments,
  RequestDetailsBottomBar,
  RequestDetailsClientCard,
  RequestDetailsDescription,
  RequestDetailsHeader,
  RequestDetailsInfoGrid,
  RequestDetailsMap,
  RequestDetailsTitleCard,
  RequestStatus,
} from '@/features/company/components/requests';

export default function CompanyRequestDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Find matching request or fallback to default Figma mock request
  const initialRequest = useMemo(() => {
    return (
      MOCK_COMPANY_REQUESTS.find((req) => req.id === id) ?? MOCK_REQUEST_DETAILS
    );
  }, [id]);

  const [currentStatus, setCurrentStatus] = useState<RequestStatus>(
    initialRequest.status,
  );

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
    Alert.alert(
      'قبول الطلب',
      `هل أنت متأكد من رغبتك في قبول طلب: "${initialRequest.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد القبول',
          style: 'default',
          onPress: () => {
            setCurrentStatus('accepted');
            Alert.alert('تم القبول', 'تم قبول الطلب بنجاح وإشعار العميل.');
          },
        },
      ],
    );
  };

  const handleReject = () => {
    Alert.alert(
      'رفض الطلب',
      `هل أنت متأكد من رغبتك في رفض طلب: "${initialRequest.title}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد الرفض',
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم الرفض', 'تم رفض الطلب بنجاح.');
          },
        },
      ],
    );
  };

  const handleChat = () => {
    Alert.alert(
      'بدء المحادثة',
      `فتح محادثة مباشرة مع العميل: ${initialRequest.client?.name ?? initialRequest.clientName}`,
    );
  };

  const handlePhotoPress = (index: number) => {
    Alert.alert('معاينة الصورة', `عرض الصورة رقم ${index + 1} بالحجم الكامل`);
  };

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
          title={initialRequest.title}
          requestNumber={initialRequest.requestNumber}
          category={initialRequest.category}
          status={currentStatus}
        />

        {/* 2x2 Key Info Grid */}
        <RequestDetailsInfoGrid
          location={initialRequest.location}
          priceRange={initialRequest.priceRange}
          publishTime={initialRequest.publishTime}
          offerType={initialRequest.offerType}
        />

        {/* Attached Photos Gallery */}
        <RequestDetailsAttachments
          images={initialRequest.images}
          totalAttachmentsCount={initialRequest.attachmentsCount}
          onPhotoPress={handlePhotoPress}
        />

        {/* Request Description */}
        <RequestDetailsDescription
          description={initialRequest.description}
        />

        {/* Location on Map */}
        <RequestDetailsMap
          location={initialRequest.location}
          latitude={initialRequest.latitude}
          longitude={initialRequest.longitude}
        />

        {/* Client Profile Card */}
        <RequestDetailsClientCard
          client={initialRequest.client}
          onChatPress={handleChat}
        />
      </ScrollView>

      {/* 3. Sticky Bottom Action Buttons */}
      <RequestDetailsBottomBar
        onAcceptPress={handleAccept}
        onRejectPress={handleReject}
      />
    </SafeAreaView>
  );
}
