import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SearchResultItem, searchService } from '@/shared/api/search.service';
import GlobalFilterSheet from '@/shared/components/filters/GlobalFilterSheet';
import AlertSuccessToast from '@/shared/components/search/AlertSuccessToast';
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

  // API Data States
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  // --- Text Search ---
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

  // --- Advanced Filter Search ---
  const fetchAdvancedResults = useCallback(
    async (filterState: AdvancedFilterState, pageNumber = 1) => {
      try {
        if (pageNumber === 1) setIsLoading(true);

        const response = await searchService.advancedSearch({
          tab: filterState.tab,
          filters: filterState.filters,
          page: pageNumber,
        });

        if (pageNumber === 1) {
          setResults(response.data);
        } else {
          setResults((prev) => [...prev, ...response.data]);
        }

        setHasNextPage(response.meta.hasNextPage);
        setTotalCount(response.meta.total);
      } catch (error) {
        console.error('Failed to fetch advanced results', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Handle "عرض النتائج" from the filter sheet
  const handleAdvancedSearch = useCallback(
    (data: { tab: string; filters: any }) => {
      setSearchText(''); // Clear text search
      setPage(1);
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

  // Unified search runner: triggers when search text OR advanced filters change.
  // This guarantees we only run ONE search fetch at a time (preventing race conditions).
  useEffect(() => {
    setPage(1);
    if (advancedFilters) {
      fetchAdvancedResults(advancedFilters, 1);
    } else {
      fetchResults(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchText, advancedFilters]);

  // Handle Load More (Pagination) — works in both modes
  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      if (advancedFilters) {
        fetchAdvancedResults(advancedFilters, nextPage);
      } else {
        fetchResults(nextPage);
      }
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
      <GlobalFilterSheet
        ref={filterSheetRef}
        onApplyFilters={handleAdvancedSearch}
      />
    </View>
  );
}
