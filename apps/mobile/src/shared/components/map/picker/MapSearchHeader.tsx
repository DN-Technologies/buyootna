import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SavedLocation } from '@/shared/api/savedLocations.service';

import type { PickedPlace, SearchResultItem } from './types';
import type { AreaMatch } from './useAreaSearch';

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
  // Our own Kuwait areas matching the query, above the Mapbox results
  areaMatches: AreaMatch[];
  onSelectArea: (match: AreaMatch) => void;
  // Shown while the search box is focused and empty
  savedPlaces: SavedLocation[];
  recentPlaces: PickedPlace[];
  onSelectPlace: (place: PickedPlace) => void;
  onDeleteSaved: (id: string) => void;
}

const SAVED_TITLES = { HOME: 'المنزل', WORK: 'العمل' } as const;
const SAVED_ICONS = { HOME: 'home', WORK: 'briefcase', OTHER: 'bookmark' } as const;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      className="px-3 pb-1 pt-2 font-cairo-semibold text-[11px] text-[#6B6A6A]"
      style={{ writingDirection: 'rtl' }}
    >
      {children}
    </Text>
  );
}

function Row({
  testID,
  icon,
  title,
  subtitle,
  onPress,
  onLongPress,
}: {
  testID: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center justify-between border-b border-gray-100 p-3"
    >
      <View className="flex-1 pr-3">
        <Text
          className="text-right font-cairo-semibold text-sm text-[#111111]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className="text-right font-cairo text-xs text-gray-500"
            numberOfLines={1}
            style={{ writingDirection: 'rtl' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Feather name={icon} size={16} color="#15304D" />
    </TouchableOpacity>
  );
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
  areaMatches,
  onSelectArea,
  savedPlaces,
  recentPlaces,
  onSelectPlace,
  onDeleteSaved,
}: MapSearchHeaderProps) {
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);

  const hasQuery = searchQuery.trim().length > 0;
  const showPlaces =
    isFocused && !hasQuery && (savedPlaces.length > 0 || recentPlaces.length > 0);
  const showResults = hasQuery && showSearchResults;

  // A Modal sits above the app's alert host, so the native alert is used
  const confirmDelete = (place: SavedLocation) =>
    Alert.alert('حذف الموقع المحفوظ', `حذف "${savedTitle(place)}"؟`, [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => onDeleteSaved(place.id),
      },
    ]);

  return (
    <View className="absolute left-4 right-4" style={{ top: insets.top + 8 }}>
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
          <Feather name="search" size={18} color="#979797" className="mr-2" />
          <TextInput
            testID="map-search-input"
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="ابحث عن منطقة أو قطعة أو معلم..."
            placeholderTextColor="#979797"
            className="flex-1 px-2 py-1 font-cairo text-sm leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            onFocus={() => {
              setIsFocused(true);
              if (hasQuery) setShowSearchResults(true);
            }}
            onBlur={() => setIsFocused(false)}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#15304D" className="ml-1" />
          ) : hasQuery ? (
            <TouchableOpacity onPress={onClearSearch} className="p-1">
              <Feather name="x" size={18} color="#979797" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {(showPlaces || showResults) && (
        <View className="mt-2 max-h-80 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
          <ScrollView keyboardShouldPersistTaps="handled">
            {showPlaces && (
              <>
                {savedPlaces.length > 0 && <SectionTitle>المحفوظة</SectionTitle>}
                {savedPlaces.map((place) => (
                  <Row
                    key={place.id}
                    testID={`map-saved-${place.id}`}
                    icon={SAVED_ICONS[place.label]}
                    title={savedTitle(place)}
                    subtitle={place.address}
                    onPress={() =>
                      onSelectPlace({
                        address: place.address,
                        lat: place.latitude,
                        lng: place.longitude,
                        details: place.details ?? undefined,
                      })
                    }
                    onLongPress={() => confirmDelete(place)}
                  />
                ))}
                {recentPlaces.length > 0 && <SectionTitle>الأخيرة</SectionTitle>}
                {recentPlaces.map((place, i) => (
                  <Row
                    key={`${place.lat},${place.lng},${i}`}
                    testID={`map-recent-${i}`}
                    icon="clock"
                    title={place.address}
                    onPress={() => onSelectPlace(place)}
                  />
                ))}
              </>
            )}

            {showResults && (
              <>
                {areaMatches.length > 0 && <SectionTitle>المناطق</SectionTitle>}
                {areaMatches.map((match) => (
                  <Row
                    key={match.id}
                    testID={`map-area-${match.id}`}
                    icon="map"
                    title={
                      match.block
                        ? `${match.area} — قطعة ${match.block}`
                        : match.area
                    }
                    subtitle={match.governorate}
                    onPress={() => onSelectArea(match)}
                  />
                ))}
                {searchResults.length > 0 && areaMatches.length > 0 && (
                  <SectionTitle>أماكن</SectionTitle>
                )}
                {searchResults.map((item) => (
                  <Row
                    key={item.id}
                    testID={`map-result-${item.id}`}
                    icon="map-pin"
                    title={item.text}
                    subtitle={item.place_name}
                    onPress={() => onSelectSearchResult(item)}
                  />
                ))}
                {!isSearching &&
                  searchResults.length === 0 &&
                  areaMatches.length === 0 && (
                    <View className="items-center p-4">
                      <Text className="font-cairo text-sm text-gray-500">
                        لم يتم العثور على نتائج طابق بحثك
                      </Text>
                    </View>
                  )}
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function savedTitle(place: SavedLocation): string {
  return place.label === 'OTHER'
    ? (place.name ?? 'موقع محفوظ')
    : SAVED_TITLES[place.label];
}
