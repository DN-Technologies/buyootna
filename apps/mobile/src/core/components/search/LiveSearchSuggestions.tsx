import {
  FlatList,
  Keyboard,
  Text,
  View,
} from 'react-native';

import { SearchResultItem } from '@/core/api/search.service';

import SuggestionCardSkeleton from '../skeletons/SuggestionCardSkeleton';
import SuggestionCard from './SuggestionCard';

export interface LiveSearchSuggestionsProps {
  searchText: string;
  results: SearchResultItem[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

export default function LiveSearchSuggestions({
  searchText,
  results,
  isLoading,
  onSelect,
}: LiveSearchSuggestionsProps) {
  return (
    <View className="flex-1 bg-[#FEFEFE]">
      {isLoading ? (
        <View style={{ padding: 20 }}>
          <SuggestionCardSkeleton />
          <SuggestionCardSkeleton />
          <SuggestionCardSkeleton />
          <SuggestionCardSkeleton />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          // Hide keyboard when the user starts scrolling through results
          onScrollBeginDrag={() => Keyboard.dismiss()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SuggestionCard
              id={item.id}
              name={item.name}
              category={item.category}
              serviceArea={item.serviceArea}
              projectsCount={item.projectsCount}
              logoUrl={item.logoUrl}
              onPress={() => onSelect(item.id)}
              onFavoritePress={() => console.log('Toggle Favorite', item.id)}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center pt-20">
          <Text className="font-cairo-semibold text-[#94A3B8]">
            {'لا توجد نتائج مطابقة لـ "'}
            {searchText}
            {'"'}
          </Text>
        </View>
      )}
    </View>
  );
}

