import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CompanyRequestItem,
  CompanyRequestListItem,
  CompanyRequestsFilterPills,
  CompanyRequestsHeader,
  CompanyRequestsScopeTabs,
  RequestScope,
  RequestStatusFilter,
  SearchIcon,
} from '@/features/company/components/requests';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';
import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { useDebounce } from '@/shared/hooks/device/useDebounce';
import { showAlert } from '@/shared/utils/alert';

export default function CompanyRequestsScreen() {
  const router = useRouter();
  const [activeScope, setActiveScope] = useState<RequestScope>('company');
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<RequestStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: requests, isLoading, refetch } = useCompanyRequests(
    activeScope,
    activeStatusFilter,
    debouncedSearch,
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleReplyPress = async (request: CompanyRequestItem) => {
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

  const handleDetailsPress = (request: CompanyRequestItem) => {
    router.push(`/(company)/(requests)/${request.id}`);
  };

  const handleFilterToggle = () => {
    Alert.alert('تصفية متقدمة', 'خيارات تصفية إضافية حسب الموقع ونطاق السعر');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 1. Header with centered title, search input & filter button */}
      <CompanyRequestsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={handleFilterToggle}
      />

      {/* 2. Dual-Scope Segmented Tabs ("خاصة بالشركة" vs "عامة") */}
      <CompanyRequestsScopeTabs
        activeScope={activeScope}
        onScopeChange={setActiveScope}
      />

      {/* 3. Status Filter Pills ("الكل", "قيد الانتظار", "مقبولة", "تم الرد") */}
      <CompanyRequestsFilterPills
        activeFilter={activeStatusFilter}
        onFilterChange={setActiveStatusFilter}
      />

      {/* 4. Requests List / Empty State */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 120, // ensure content clears floating tab bar
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#15304D"
          />
        }
      >
        {requests.length > 0 ? (
          requests.map((request) => (
            <CompanyRequestListItem
              key={request.id}
              request={request}
              onReply={handleReplyPress}
              onDetails={handleDetailsPress}
              onPress={handleDetailsPress}
            />
          ))
        ) : (
          <View className="items-center justify-center py-16">
            <View className="mb-4 size-16 items-center justify-center rounded-full bg-[#F5F7F9]">
              <SearchIcon size={32} color="#989898" />
            </View>
            <Text
              className="font-cairo-bold text-[16px] text-[#111111]"
              style={{ writingDirection: 'rtl', textAlign: 'center' }}
            >
              لا توجد طلبات مطابقة
            </Text>
            <Text
              className="mt-1 font-cairo-medium text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl', textAlign: 'center' }}
            >
              جرب تغيير كلمات البحث أو تغيير حالة التصفية
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
