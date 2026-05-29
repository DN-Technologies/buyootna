import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import CompanyCard from '@/core/components/CompanyCard';
import AlertSuccessToast from '@/core/components/search/AlertSuccessToast';
import EmptySearchResult from '@/core/components/search/EmptySearchResult';
import SearchHeader from '@/core/components/search/SearchHeader';

// Type Definitions for strict tab safety

export default function SearchResultsScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams(); // Retrieve search term passed from previous screen
  const searchString =
    typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '';

  // --- Toast State ---
  const [showToast, setShowToast] = useState(false);

  // --- 2. Mock Data for Companies (Matching Figma results) ---
  const mockCompanies: any[] = [
    // {
    //   id: '1',
    //   name: 'شركة البناء المتقن',
    //   category: 'تشطيب • تصميم داخلي • تنفيذ',
    //   serviceArea: 'يخدم جميع المناطق',
    //   projectsCount: '+85',
    //   logoUrl:
    //     'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    //   isFavorite: false,
    // },
    // {
    //   id: '2',
    //   name: 'شركة البناء المتقن',
    //   category: 'تشطيب • تصميم داخلي • تنفيذ',
    //   serviceArea: 'يخدم جميع المناطق',
    //   projectsCount: '+85',
    //   logoUrl:
    //     'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    //   isFavorite: true,
    // },
  ];

  const handleActivateAlert = () => {
    // Here we would normally make an API call to save the user's alert preference
    console.log(`Alert activated for query: ${query}`);
    setShowToast(true); // Trigger the toast animation
  };

  const handleExploreNow = () => {
    // Reset filters or go back to home
    router.push('/home');
  };

  return (
    <View className="flex-1 bg-white">
      {/* --- HEADER LAYER --- */}
      <SearchHeader
        searchText={searchString}
        setSearchText={() => {}}
        isFocused={false}
        setIsFocused={() => {}}
        onBack={() => router.back()}
        onFilterPress={() => {}}
      />

      {/* --- RESULTS META OVERVIEW LAYER --- */}
      <View className="flex-row items-center justify-between px-5 py-5">
        {/* Left: Sorting selection indicator */}
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

        {/* Right: Direct quantity configuration label */}
        <Text className="font-cairo-medium text-xs text-[#94A3B8]">
          {mockCompanies.length} نتيجة لبحثك
        </Text>
      </View>

      {/* --- MAIN VERTICAL SCROLLABLE LIST --- */}
      <FlatList
        data={mockCompanies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CompanyCard
            id={item.id}
            name={item.name}
            category={item.category}
            serviceArea={item.serviceArea}
            projectsCount={item.projectsCount}
            logoUrl={item.logoUrl}
            isFavorite={item.isFavorite}
            rating={3.5}
            onPress={() => console.log('View profile setup', item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptySearchResult
            onActivateAlert={handleActivateAlert}
            onExploreNow={handleExploreNow}
          />
        }
      />

      {/* --- Floating Success Toast --- */}
      <AlertSuccessToast
        visible={showToast}
        message={`تم تفعيل تنبيهات لـ ${query || 'هذا البحث'}`}
        onHide={() => setShowToast(false)}
        onUndo={() => console.log('Alert cancelled by user')}
      />
    </View>
  );
}
