import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SortIcon } from '@/assets/icons';
import { HomeSearchIcon } from '@/assets/icons/home/header';
import CompanyListCard from '@/features/individual/components/companies/CompanyListCard';
import { feedService } from '@/features/individual/services/feed.service';
import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import CategoryFilterSheet, {
  COMPANY_CATEGORY_OPTIONS,
} from '@/shared/components/filters/CategoryFilterSheet';
import CompanySkeleton from '@/shared/components/skeletons/CompanySkeleton';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useTabBarHeight } from '@/shared/hooks/useTabBarHeight';
import { openChatWith } from '@/shared/utils/openChat';

export default function CompaniesScreen() {
  const router = useRouter();
  const { scrollContentBottomPadding } = useTabBarHeight();
  const { guardAction, authSheetRef } = useAuthGuard();
  const quoteModalRef = useRef<BottomSheetModal>(null);
  const categorySheetRef = useRef<BottomSheetModal>(null);
  const listRef = useRef<FlashListRef<any>>(null);
  useScrollToTop(listRef);

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 400);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'all',
  ]);
  const categoryParam = selectedCategories.includes('all')
    ? undefined
    : selectedCategories.join(',');
  const categoryLabel =
    selectedCategories.includes('all') || selectedCategories.length === 0
      ? 'التصنيف'
      : selectedCategories.length === 1
        ? (COMPANY_CATEGORY_OPTIONS.find(
            (c) => c.id === selectedCategories[0],
          )?.label ?? 'التصنيف')
        : `${COMPANY_CATEGORY_OPTIONS.find((c) => c.id === selectedCategories[0])?.label} +${
            selectedCategories.length - 1
          }`;

  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const [selectedCompanyName, setSelectedCompanyName] = useState('الشركة');

  // --- Fetch companies whenever the category or search text changes ---
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['companies', categoryParam, debouncedSearchText.trim()],
    queryFn: ({ pageParam }) =>
      feedService.getCompanies(
        categoryParam,
        pageParam,
        10,
        debouncedSearchText.trim() || undefined,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
  });

  const data = useMemo(() => {
    const combined = infiniteData?.pages.flatMap((page) => page.data) ?? [];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [infiniteData]);

  const isFetchingRef = useRef(false);
  const fetchMoreData = () => {
    if (hasNextPage && !isLoadingMore && !isLoading && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
    }
  };

  const handleQuotePress = (companyName: string) => {
    setSelectedCompanyName(companyName);
    quoteModalRef.current?.present();
  };

  const handleChatPress = (companyUserId: string) => {
    // Opens the chat at once; the chat screen creates the conversation
    guardAction(() => openChatWith(router, { recipientId: companyUserId }));
  };

  const renderHeader = () => (
    <View className="pb-3">
      {/* Title Row */}
      <View className="flex-row items-center justify-between py-5">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10"
        >
          <Feather name="chevron-right" size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          شركات
        </Text>
        <View className="w-10" />
      </View>

      {/* Filter + Search Row */}
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-[40px] flex-1 flex-row items-center rounded-full border border-[#ECECEC] bg-[#F9FAFE] px-4">
          <HomeSearchIcon size={18} color="#989898" />
          <TextInput
            className="h-full flex-1 text-right px-2 font-cairo-medium text-[13px] text-[#111111]"
            placeholder="ابحث باسم الشركة..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/search',
              params: { openFilter: 'true' },
            })
          }
          className="h-11 w-11 items-center justify-center rounded-full border border-[#ECECEC] bg-[#F8FAFC]"
        >
          <SortIcon size={18} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Category Filter Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => categorySheetRef.current?.present()}
        className="h-11 flex-row items-center justify-between rounded-2xl bg-[#F8FAFC] px-4"
      >
        <Text
          className="font-cairo-medium text-[13px] text-[#111111]"
          numberOfLines={1}
        >
          {categoryLabel}
        </Text>
        <Feather name="chevron-up" size={16} color="#111111" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={{ paddingTop: 10 }}>
          {[1, 2, 3].map((key) => (
            <CompanySkeleton key={key} cardWidth="100%" />
          ))}
        </View>
      );
    }
    return (
      <View className="items-center justify-center py-20">
        <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
          لا توجد شركات
        </Text>
        <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
          عذراً، لا توجد شركات مطابقة لبحثك حالياً. جرب تغيير كلمة البحث أو
          التصنيف.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlashList
          ref={listRef}
          data={data}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: scrollContentBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CompanyListCard
              id={item.id}
              name={item.name}
              category={item.category}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              projectsCount={item.projectsCount}
              lastActivityAt={item.lastActivityAt}
              logoUrl={item.logoUrl}
              isVerified={item.isVerified}
              isFavorite={favoriteOverrides[item.id] ?? item.isFavorite ?? false}
              onPress={() => router.push(`/company/${item.id}` as any)}
              onToggleFavorite={() =>
                setFavoriteOverrides((prev) => ({
                  ...prev,
                  [item.id]: !(prev[item.id] ?? item.isFavorite ?? false),
                }))
              }
              onChatPress={() => handleChatPress(item.userId)}
              onQuotePress={() => handleQuotePress(item.name)}
            />
          )}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#15304D" />
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>

      <QuoteRequestModal
        ref={quoteModalRef}
        companyName={selectedCompanyName}
      />
      <CategoryFilterSheet
        ref={categorySheetRef}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      <AuthGuardSheet ref={authSheetRef} />
    </SafeAreaView>
  );
}
