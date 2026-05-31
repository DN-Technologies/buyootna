import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SearchResultItem, searchService } from '@/core/api/search.service';
import GlobalFilterSheet from '@/core/components/filters/GlobalFilterSheet';
import AlertSuccessToast from '@/core/components/search/AlertSuccessToast';
import EmptySearchResult from '@/core/components/search/EmptySearchResult';
import SearchHeader from '@/core/components/search/SearchHeader';
import SuggestionCard from '@/core/components/search/SuggestionCard';
import SuggestionCardSkeleton from '@/core/components/skeletons/SuggestionCardSkeleton';
import { useDebounce } from '@/core/hooks/useDebounce';

export default function SearchResultsScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const { query } = useLocalSearchParams();

  // Text state for Search Bar input
  const [searchText, setSearchText] = useState(
    typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '',
  );
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);

  // API Data States
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch function
  const fetchResults = useCallback(
    async (pageNumber = 1) => {
      try {
        if (pageNumber === 1) setIsLoading(true);

        const response = await searchService.globalSearch({
          query: debouncedSearchText.trim() || undefined,
          page: pageNumber,
          limit: 10,
        });

        if (pageNumber === 1) {
          setResults(response.data);
        } else {
          setResults((prev) => [...prev, ...response.data]);
        }

        setHasNextPage(response.meta.hasNextPage);
        setTotalCount(response.meta.total);
      } catch (error) {
        console.error('Failed to fetch results', error);
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchText],
  );

  // Sync external route query changes with local search text
  useEffect(() => {
    if (query) {
      setSearchText(typeof query === 'string' ? query : query[0]);
    }
  }, [query]);

  // Trigger fetch when query changes
  useEffect(() => {
    setPage(1);
    fetchResults(1);
  }, [fetchResults]);

  // Handle Load More (Pagination)
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(nextPage);
    }
  };

  // --- Toast State ---
  const [showToast, setShowToast] = useState(false);

  const handleActivateAlert = () => {
    console.log(`Alert activated for query: ${searchText}`);
    setShowToast(true);
  };

  const handleExploreNow = () => {
    router.push('/home');
  };

  return (
    <View className="flex-1 bg-white">
      {/* --- HEADER --- */}
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        onBack={() => router.back()}
        onFilterPress={() => filterSheetRef.current?.present()}
      />

      {/* --- RESULTS META --- */}
      <View className="flex-row items-center justify-between px-5 py-5">
        {/* Left: Sorting */}
        <TouchableOpacity activeOpacity={0.7} className="flex-row items-center">
          <Feather name="chevron-down" size={14} color="#6B6A6A" />
          <Text className="ml-1 font-cairo-semibold text-xs text-[#6B6A6A]">
            الترتيب حسب
          </Text>
          <Feather
            name="align-left"
            size={14}
            color="#6B6A6A"
            className="ml-1.5"
          />
        </TouchableOpacity>

        {/* Right: Count */}
        <Text className="font-cairo-medium text-xs text-[#94A3B8]">
          {totalCount} نتيجة لبحثك
        </Text>
      </View>

      {/* --- RESULTS LIST --- */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SuggestionCard
            id={item.id}
            name={item.name}
            category={item.category}
            serviceArea={item.serviceArea}
            projectsCount={item.projectsCount}
            logoUrl={item.logoUrl}
            isFavorite={item.isFavorite}
            onPress={() => {
              router.push(`/company/${item.id}` as any);
            }}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <SuggestionCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptySearchResult
              onActivateAlert={handleActivateAlert}
              onExploreNow={handleExploreNow}
            />
          )
        }
        ListFooterComponent={
          isLoading && results.length > 0 ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#15304D" />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* --- Floating Success Toast --- */}
      <AlertSuccessToast
        visible={showToast}
        message={`تم تفعيل تنبيهات لـ ${searchText || 'هذا البحث'}`}
        onHide={() => setShowToast(false)}
        onUndo={() => console.log('Alert cancelled by user')}
      />
      <GlobalFilterSheet ref={filterSheetRef} />
    </View>
  );
}
