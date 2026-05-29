import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import CompanyCard from '@/core/components/CompanyCard';
import SearchHeader from '@/core/components/search/SearchHeader';

// Type Definitions for strict tab safety

export default function SearchResultsScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams(); // Retrieve search term passed from previous screen
  const searchString =
    typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '';

  // --- 1. Tab & Filter States ---

  // --- 2. Mock Data for Companies (Matching Figma results) ---
  const mockCompanies = [
    {
      id: '1',
      name: 'شركة البناء المتقن',
      category: 'تشطيب • تصميم داخلي • تنفيذ',
      serviceArea: 'يخدم جميع المناطق',
      projectsCount: '+85',
      logoUrl:
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      isFavorite: false,
    },
    {
      id: '2',
      name: 'شركة البناء المتقن',
      category: 'تشطيب • تصميم داخلي • تنفيذ',
      serviceArea: 'يخدم جميع المناطق',
      projectsCount: '+85',
      logoUrl:
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      isFavorite: true,
    },
  ];

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

      {/* --- LEVEL 1: MAIN CATEGORY TABS ---
      <View className="flex-row justify-between border-b border-gray-100 px-5 pt-2">
        {(
          [
            { id: 'properties', label: 'عقارات' },
            { id: 'companies', label: 'شركات' },
            { id: 'auctions', label: 'مزادات' },
            { id: 'deals', label: 'صفقات' },
          ] as const
        ).map((tab) => {
          const isActive = activeMainTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => setActiveMainTab(tab.id)}
              className="flex-1 items-center pb-3"
            >
              <Text
                className={`font-cairo-bold text-[15px] ${isActive ? 'text-[#15304D]' : 'text-[#94A3B8]'}`}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View className="absolute bottom-0 h-[2.5px] w-full rounded-t-full bg-[#15304D]" />
              )}
            </TouchableOpacity>
          );
        })}
      </View> */}

      {/* --- LEVEL 2: CONTEXTUAL SUB-CATEGORY PILLS ---
      {activeMainTab === 'companies' && (
        <View className="py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              flexDirection: 'row-reverse',
            }} // Custom RTL handling for standard ScrollView
          >
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'decorations', label: 'ديكورات' },
                { id: 'interior_design', label: 'تصميم داخلي' },
                { id: 'finishing', label: 'تشطيب' },
              ] as const
            ).map((subTab) => {
              const isActive = activeSubTab === subTab.id;
              return (
                <TouchableOpacity
                  key={subTab.id}
                  activeOpacity={0.7}
                  onPress={() => setActiveSubTab(subTab.id)}
                  className={`ml-2 rounded-full border px-5 py-2 ${
                    isActive
                      ? 'border-[#15304D] bg-[#15304D]'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text
                    className={`font-cairo-semibold text-xs ${isActive ? 'text-white' : 'text-[#111111]'}`}
                  >
                    {subTab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )} */}

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
          <View className="items-center justify-center pt-20">
            <Text className="font-cairo-medium text-[#94A3B8]">
              لا توجد نتائج لعرضها في هذا القسم
            </Text>
          </View>
        }
      />
    </View>
  );
}
