import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { searchService } from '@/shared/api/search.service';
import GlobalFilterSheet from '@/shared/components/filters/GlobalFilterSheet';
import EmptySearchResult from '@/shared/components/search/EmptySearchResult';
import SearchHeader from '@/shared/components/search/SearchHeader';
import SuggestionCard from '@/shared/components/search/SuggestionCard';
import SuggestionCardSkeleton from '@/shared/components/skeletons/SuggestionCardSkeleton';
import { useDebounce } from '@/shared/hooks/useDebounce';

// Holds the active advanced filter context for pagination
interface AdvancedFilterState {
  tab: string;
  filters: any;
}

export default function SearchResultsScreen() {
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const {
    query,
    tab: routeTab,
    filters: routeFilters,
  } = useLocalSearchParams();

  // Text state for Search Bar input
  const [searchText, setSearchText] = useState(
    typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '',
  );
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);

  // Parse route params on initialization to prevent dual fetching race conditions on mount
  const initialAdvancedFilters = useMemo(() => {
    if (routeTab && routeFilters) {
      try {
        const tab = typeof routeTab === 'string' ? routeTab : routeTab[0];
        const filters = JSON.parse(
          typeof routeFilters === 'string' ? routeFilters : routeFilters[0],
        );
        return { tab, filters };
      } catch (e) {
        console.error('Failed to parse route filter params', e);
      }
    }
    return null;
  }, [routeTab, routeFilters]);

  // Advanced filter mode state
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedFilterState | null>(initialAdvancedFilters);

  // Unified search runner: keyed on search text OR advanced filters, so
  // switching between the two starts a brand-new paginated query.
  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      'searchResults',
      debouncedSearchText.trim(),
      advancedFilters,
    ],
    queryFn: ({ pageParam }) =>
      advancedFilters
        ? searchService.advancedSearch({
            tab: advancedFilters.tab,
            filters: advancedFilters.filters,
            page: pageParam,
          })
        : searchService.globalSearch({
            query: debouncedSearchText.trim() || undefined,
            page: pageParam,
            limit: 10,
          }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.current + 1 : undefined,
  });

  const results = infiniteData?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = infiniteData?.pages[0]?.meta.total ?? 0;

  // Handle "عرض النتائج" from the filter sheet
  const handleAdvancedSearch = useCallback(
    (data: { tab: string; filters: any }) => {
      setSearchText(''); // Clear text search
      setAdvancedFilters(data);
    },
    [],
  );

  // Sync external route query changes with local search text
  useEffect(() => {
    if (query) {
      setSearchText(typeof query === 'string' ? query : query[0]);
    }
  }, [query]);

  // When the user types, switch back to text search mode by clearing advanced filters
  useEffect(() => {
    if (debouncedSearchText) {
      setAdvancedFilters(null);
    }
  }, [debouncedSearchText]);

  // Handle Load More (Pagination) — works in both modes
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  const handleActivateAlert = () => {
    router.push('/add-alert');
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
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center gap-1"
        >
          <Feather name="align-left" size={14} color="#6B6A6A" />
          <Text className="font-cairo-semibold text-xs leading-[22px] text-[#6B6A6A]">
            الترتيب حسب
          </Text>
          <Feather
            name="chevron-down"
            size={14}
            color="#6B6A6A"
            className="relative top-0.5"
          />
        </TouchableOpacity>

        {/* Right: Count */}
        <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
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
          isFetchingNextPage && results.length > 0 ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color="#15304D" />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <GlobalFilterSheet
        ref={filterSheetRef}
        onApplyFilters={handleAdvancedSearch}
      />
    </View>
  );
}
