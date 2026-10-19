import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CompanyRequestItem,
  CompanyRequestListItem,
  CompanyRequestsFilterPills,
  CompanyRequestsHeader,
  CompanyRequestsScopeTabs,
  EMPTY_REQUEST_FILTERS,
  RequestFilterDraft,
  RequestFilterSheet,
  RequestListTab,
  RequestReplySheet,
  RequestScope,
  SearchIcon,
  toRequestListFilters,
} from '@/features/company/components/requests';
import { useCompanyRequests } from '@/features/company/hooks/useCompanyRequests';
import { useDebounce } from '@/shared/hooks/device/useDebounce';

export default function CompanyRequestsScreen() {
  const router = useRouter();
  const [activeScope, setActiveScope] = useState<RequestScope>('company');
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<RequestListTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterDraft, setFilterDraft] =
    useState<RequestFilterDraft>(EMPTY_REQUEST_FILTERS);
  const filters = useMemo(() => toRequestListFilters(filterDraft), [filterDraft]);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const replySheetRef = useRef<BottomSheetModal>(null);
  const [replyTo, setReplyTo] = useState<CompanyRequestItem | null>(null);

  const { data: requests, isLoading, refetch } = useCompanyRequests(
    activeScope,
    activeStatusFilter,
    debouncedSearch,
    filters,
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // الرد: the reply sheet (message / notes), not a chat
  const handleReplyPress = (request: CompanyRequestItem) => {
    setReplyTo(request);
    replySheetRef.current?.present();
  };

  const handleDetailsPress = (request: CompanyRequestItem) => {
    router.push(`/(company)/(requests)/${request.id}`);
  };


  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 1. Header with centered title, search input & filter button */}
      <CompanyRequestsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => filterSheetRef.current?.present()}
        filterActive={Object.keys(filters).length > 0}
      />

      {/* 2. Dual-Scope Segmented Tabs ("خاصة بالشركة" vs "عامة") */}
      <CompanyRequestsScopeTabs
        activeScope={activeScope}
        onScopeChange={setActiveScope}
      />

      {/* 3. Status chips, then المفضلة */}
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

      <RequestFilterSheet
        ref={filterSheetRef}
        value={filterDraft}
        onApply={setFilterDraft}
      />
      <RequestReplySheet ref={replySheetRef} request={replyTo} />
    </SafeAreaView>
  );
}
