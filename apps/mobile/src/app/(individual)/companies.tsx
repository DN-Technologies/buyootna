import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterHorizontalIcon, HomeSearchIcon } from '@/assets/icons/home/header';
import CompanyListCard from '@/features/individual/components/companies/CompanyListCard';
import { feedService } from '@/features/individual/services/feed.service';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import CompanySkeleton from '@/shared/components/skeletons/CompanySkeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CompanyDto } from '@/types/feed';

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'تصميم داخلي', label: 'تصميم داخلي' },
  { id: 'تشطيب', label: 'تشطيب' },
  { id: 'حمام سباحة', label: 'حمام سباحة' },
  { id: 'مكاتب هندسية', label: 'مكاتب هندسية' },
];

export default function CompaniesScreen() {
  const router = useRouter();
  const quoteModalRef = useRef<BottomSheetModal>(null);

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 400);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [category, setCategory] = useState('all');

  const [data, setData] = useState<CompanyDto[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const [selectedCompanyName, setSelectedCompanyName] = useState('الشركة');

  // --- Fetch companies whenever the category or search text changes ---
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await feedService.getCompanies(
          category,
          1,
          10,
          debouncedSearchText.trim() || undefined,
        );
        setData(response.data);
        setPage(response.meta.current);
        setHasNextPage(response.meta.hasNextPage);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [category, debouncedSearchText]);

  const fetchMoreData = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || isLoading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await feedService.getCompanies(
        category,
        nextPage,
        10,
        debouncedSearchText.trim() || undefined,
      );
      setData((prev) => {
        const combined = [...prev, ...response.data];
        return combined.filter(
          (item, idx) => combined.findIndex((i) => i.id === item.id) === idx,
        );
      });
      setPage(response.meta.current);
      setHasNextPage(response.meta.hasNextPage);
    } catch (error) {
      console.error('Failed to load more companies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [category, debouncedSearchText, hasNextPage, isLoading, isLoadingMore, page]);

  const handleQuotePress = (companyName: string) => {
    setSelectedCompanyName(companyName);
    quoteModalRef.current?.present();
  };

  const renderHeader = () => (
    <View className="pb-3">
      {/* Title Row */}
      <View className="flex-row items-center justify-between py-5">
        <View className="w-10" />
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          شركات
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/search',
              params: { openFilter: 'true' },
            })
          }
          className="w-10 items-end"
        >
          <Feather name="chevron-right" size={22} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Filter + Search Row */}
      <View className="mb-3 flex-row items-center gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/search',
              params: { openFilter: 'true' },
            })
          }
          className="h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
        >
          <FilterHorizontalIcon size={18} color="#111111" />
        </TouchableOpacity>

        <View className="h-11 flex-1 flex-row items-center rounded-full border border-gray-100 bg-[#F8FAFC] px-4">
          <TextInput
            className="h-full flex-1 text-right font-cairo-medium text-[13px] text-[#111111]"
            placeholder="ابحث باسم الشركة..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          <HomeSearchIcon size={18} color="#989898" />
        </View>
      </View>

      {/* Category Accordion */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsCategoryOpen((prev) => !prev)}
        className="h-11 flex-row items-center justify-between rounded-2xl bg-[#F8FAFC] px-4"
      >
        <Feather
          name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#111111"
        />
        <Text className="font-cairo-semibold text-sm text-[#111111]">
          التصنيف
        </Text>
      </TouchableOpacity>

      {isCategoryOpen && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.7}
                onPress={() => setCategory(cat.id)}
                className={`rounded-full border px-4 py-2 ${
                  isActive
                    ? 'border-[#15304D] bg-[#15304D]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text
                  className={`font-cairo-semibold text-xs ${
                    isActive ? 'text-white' : 'text-[#111111]'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
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
            onChatPress={() => router.push(`/chat/${item.userId}` as any)}
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

      <QuoteRequestModal
        ref={quoteModalRef}
        companyName={selectedCompanyName}
      />
    </SafeAreaView>
  );
}
