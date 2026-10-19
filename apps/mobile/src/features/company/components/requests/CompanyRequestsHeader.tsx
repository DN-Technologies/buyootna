import { Text,TextInput, TouchableOpacity, View } from 'react-native';

import { FilterSlidersIcon, SearchIcon } from './icons';

export interface CompanyRequestsHeaderProps {
  title?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterPress?: () => void;
  // تصفية البحث narrows the list: a dot on the button
  filterActive?: boolean;
}

export default function CompanyRequestsHeader({
  title = 'الطلبات',
  searchQuery,
  onSearchChange,
  onFilterPress,
  filterActive = false,
}: CompanyRequestsHeaderProps) {
  return (
    <View className="bg-white pb-3 pt-2">
      {/* 1. Title Row (Centered) */}
      <View className="h-[44px] flex-row items-center justify-center px-4">
        <Text
          testID="company-requests-title"
          className="font-cairo-semibold text-[18px] text-[#111111] text-center"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
      </View>

      {/* 2. Search & Filter Bar Row (RTL: Child 0 is Visual Right, Child 1 is Visual Left) */}
      <View className="mt-2 flex-row items-center gap-2.5 px-4">
        {/* Visual Right (Child 0): Search Input Pill */}
        <View className="h-[42px] flex-1 flex-row items-center justify-between rounded-full border border-[#ECECEC] bg-[#F9FAFE] px-3.5">
          <TextInput
            testID="company-requests-search-input"
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="ابحث عن طلب عرض سعر..."
            placeholderTextColor="#989898"
            className="flex-1 font-cairo-regular text-[13px] text-[#111111]"
            style={{ writingDirection: 'rtl', textAlign: 'right' }}
          />
          <View className="ms-2">
            <SearchIcon size={20} color="#989898" />
          </View>
        </View>

        {/* Visual Left (Child 1): Circular Filter Button */}
        <TouchableOpacity
          testID="company-requests-filter-button"
          onPress={onFilterPress}
          activeOpacity={0.7}
          className="size-[42px] items-center justify-center rounded-full border border-[#ECECEC] bg-[#F9FAFE]"
          accessibilityLabel="تصفية الطلبات"
        >
          <FilterSlidersIcon size={20} color="#111111" />
          {filterActive && (
            <View
              testID="company-requests-filter-active-dot"
              className="absolute right-2 top-2 size-2 rounded-full bg-[#15304D]"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
