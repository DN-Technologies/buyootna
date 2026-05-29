import { FlatList, Keyboard, Text, View } from 'react-native';

import SuggestionCard from './SuggestionCard';

export interface LiveSearchSuggestionsProps {
  searchText: string;
  onSelect: (id: string) => void;
}

// Mock Data matching the screenshot
const MOCK_COMPANIES = [
  {
    id: '1',
    name: 'شركة البناء المتقن',
    category: 'تشطيب • تصميم داخلي • تنفيذ',
    serviceArea: 'يخدم جميع المناطق',
    projectsCount: '85+',
    logoUrl:
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80', // Placeholder
  },
  {
    id: '2',
    name: 'شركة البناء الحديث',
    category: 'تشطيب • تصميم داخلي • تنفيذ',
    serviceArea: 'يخدم جميع المناطق',
    projectsCount: '120+',
    logoUrl:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
  },
];

export default function LiveSearchSuggestions({
  searchText,
  onSelect,
}: LiveSearchSuggestionsProps) {
  // Simple local filter: if the name or category includes the search text
  const filteredResults = MOCK_COMPANIES.filter(
    (company) =>
      company.name.includes(searchText) ||
      company.category.includes(searchText),
  );

  return (
    <View className="flex-1 bg-[#FEFEFE]">
      {filteredResults.length > 0 ? (
        <FlatList
          data={filteredResults}
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
            جاري البحث...
          </Text>
        </View>
      )}
    </View>
  );
}
