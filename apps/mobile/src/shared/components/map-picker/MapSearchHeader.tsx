import { Feather } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchResultItem } from './types';

interface MapSearchHeaderProps {
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  searchResults: SearchResultItem[];
  onSelectSearchResult: (item: SearchResultItem) => void;
}

export function MapSearchHeader({
  onClose,
  searchQuery,
  onSearchChange,
  onClearSearch,
  isSearching,
  showSearchResults,
  setShowSearchResults,
  searchResults,
  onSelectSearchResult,
}: MapSearchHeaderProps) {
  return (
    <SafeAreaView className="absolute left-4 right-4 top-2">
      <View className="flex-row items-center gap-2">
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onClose}
          className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-lg"
        >
          <Feather name="arrow-right" size={22} color="#15304D" />
        </TouchableOpacity>

        {/* Search Input Bar */}
        <View className="h-12 flex-1 flex-row items-center rounded-2xl border border-gray-100 bg-white px-3 shadow-lg">
          <Feather name="search" size={18} color="#94A3B8" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="ابحث عن منطقة، حي، أو معلم..."
            placeholderTextColor="#94A3B8"
            className="flex-1 px-2 py-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchResults(true);
            }}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#15304D" className="ml-1" />
          ) : searchQuery ? (
            <TouchableOpacity onPress={onClearSearch} className="p-1">
              <Feather name="x" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Autocomplete Results Dropdown */}
      {showSearchResults && (
        <View className="mt-2 max-h-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
          {searchResults.length === 0 && !isSearching ? (
            <View className="items-center p-4">
              <Text className="font-cairo text-sm text-gray-500">
                لم يتم العثور على نتائج طابق بحثك
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onSelectSearchResult(item)}
                  className="flex-row items-center justify-between border-b border-gray-100 p-3"
                >
                  <View className="flex-1 pr-3">
                    <Text
                      className="text-right font-cairo-semibold text-sm text-[#111111]"
                      style={{ writingDirection: 'rtl' }}
                    >
                      {item.text}
                    </Text>
                    <Text
                      className="text-right font-cairo text-xs text-gray-500"
                      numberOfLines={1}
                      style={{ writingDirection: 'rtl' }}
                    >
                      {item.place_name}
                    </Text>
                  </View>
                  <Feather name="map-pin" size={16} color="#15304D" />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
