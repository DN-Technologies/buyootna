import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import LiveSearchSuggestions from '@/core/components/search/LiveSearchSuggestions';
import SearchActiveOverlay from '@/core/components/search/SearchActiveOverlay';
import SearchHeader from '@/core/components/search/SearchHeader';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(true); // Default to true so keyboard opens

  useEffect(() => {
    if (params.openFilter === 'true') {
      console.log('Open Filter Modal triggered from Home Search Bar');
      // When filter modal is implemented, trigger it here.
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

  const handleRemoveRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  };

  const handleSelectSearch = (term: string) => {
    setSearchText(term);
    // In Card 3, this will trigger the API search and hide the overlay!
  };

  const handleSelectResult = (id: string) => {
    // For now, let's just log it.
    // In Card 3, this will route to the results page: router.push(`/explore/search-results?query=${searchText}`)
    console.log('Selected Company ID:', id);
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
        onFilterPress={() => console.log('Open Filter Modal')}
      />

      {/* 2. Conditional Rendering Magic */}
      {searchText.trim().length === 0 ? (
        // Show History if input is empty
        <SearchActiveOverlay
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          onSelectSearch={handleSelectSearch}
          onRemoveRecent={handleRemoveRecent}
        />
      ) : (
        // Show Live Suggestions if user is typing
        <LiveSearchSuggestions
          searchText={searchText}
          onSelect={handleSelectResult}
        />
      )}
    </KeyboardAvoidingView>
  );
}
