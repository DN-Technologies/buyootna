import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { SearchResultItem, searchService } from '@/core/api/search.service';
import GlobalFilterSheet from '@/core/components/filters/GlobalFilterSheet';
import LiveSearchSuggestions from '@/core/components/search/LiveSearchSuggestions';
import SearchActiveOverlay from '@/core/components/search/SearchActiveOverlay';
import SearchHeader from '@/core/components/search/SearchHeader';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useAuthStore } from '@/store/useAuthStore';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = useAuthStore((state) => state.token);
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(true); // Default to true so keyboard opens

  // --- API State ---
  const debouncedSearchText = useDebounce(searchText, 300); // Wait 300ms
  const [liveResults, setLiveResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const filterSheetRef = useRef<BottomSheetModal>(null);

  // Navigate to results screen with advanced filter payload
  const handleAdvancedSearch = useCallback(
    (data: { tab: string; filters: any }) => {
      router.push({
        pathname: '/search/results',
        params: {
          tab: data.tab,
          filters: JSON.stringify(data.filters),
        },
      });
    },
    [router],
  );

  useEffect(() => {
    if (params.openFilter === 'true') {
      // Small timeout to allow the sheet to be fully rendered and registered before expanding
      setTimeout(() => {
        filterSheetRef.current?.present();
      }, 100);
    }
  }, [params.openFilter]);

  // Mock State (We will hook this to Zustand/AsyncStorage later)
  const [recentSearches, setRecentSearches] = useState([
    'فيلا للإيجار',
    'شقة 3 غرف وصالة',
    'شقق للبيع في السالمية',
    'عقارات في حولي',
  ]);

  const popularSearches = ['شركات تشطيب', 'السالمية', 'سكني', 'شقق للإيجار'];

  // Trigger search when debounced text changes
  useEffect(() => {
    const fetchLiveSuggestions = async () => {
      // Don't search if text is too short or empty
      if (debouncedSearchText.trim().length < 2) {
        setLiveResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // We default to searching companies for the live dropdown, but we could search ALL
        const response = await searchService.globalSearch({
          query: debouncedSearchText,
          limit: 5, // Just get top 5 for the quick dropdown
        });
        setLiveResults(response.data);
      } catch (error) {
        console.error('Live search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchLiveSuggestions();
  }, [debouncedSearchText]);

  const handleSelectResult = (id: string) => {
    // Navigate straight to the detail page (Company or Property)
    // We'll assume Company for now based on Figma context
    // router.push(`/company/${id}`);
    console.log(id);
  };

  const handleRemoveRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  };

  const handleSelectSearch = (term: string) => {
    setSearchText(term);
    // Redirect cleanly to the results screen layout passing parameters
    router.push({
      pathname: '/search/results',
      params: { query: term },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#FEFEFE]"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 1. Header */}
      <SearchHeader
        searchText={searchText}
        setSearchText={setSearchText}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        onBack={() => router.back()}
        onFilterPress={() => filterSheetRef.current?.present()}
      />

      {/* 2. Conditional Rendering Magic */}
      {searchText.trim().length === 0 ? (
        // Show History if input is empty
        <SearchActiveOverlay
          recentSearches={token ? recentSearches : []}
          popularSearches={popularSearches}
          onSelectSearch={handleSelectSearch}
          onRemoveRecent={handleRemoveRecent}
        />
      ) : (
        // Show Live Suggestions if user is typing
        <LiveSearchSuggestions
          searchText={searchText}
          results={liveResults}
          isLoading={isSearching}
          onSelect={handleSelectResult}
        />
      )}
      <GlobalFilterSheet
        ref={filterSheetRef}
        onApplyFilters={handleAdvancedSearch}
      />
    </KeyboardAvoidingView>
  );
}
