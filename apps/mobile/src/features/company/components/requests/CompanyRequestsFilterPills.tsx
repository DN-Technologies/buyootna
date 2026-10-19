import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { RequestListTab } from './types';

export interface CompanyRequestsFilterPillsProps {
  activeFilter: RequestListTab;
  onFilterChange: (filter: RequestListTab) => void;
}

interface FilterOption {
  key: RequestListTab;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'accepted', label: 'مقبولة' },
  { key: 'responded', label: 'تم الرد' },
  { key: 'rejected', label: 'مرفوضة' },
  // The requests this company saved from ⋮ › اضافة الى المفضلة
  { key: 'saved', label: 'المفضلة' },
];

export default function CompanyRequestsFilterPills({
  activeFilter,
  onFilterChange,
}: CompanyRequestsFilterPillsProps) {
  return (
    <View className="bg-white">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
          flexDirection: 'row',
        }}
      >
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              testID={`company-requests-filter-${filter.key}`}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.7}
              className={`h-[32px] items-center justify-center rounded-[16px] px-3.5 ${
                isActive
                  ? 'border-[1.2px] border-[#B28648] bg-[#F5F7F9]'
                  : 'border border-transparent bg-[#F5F7F9]'
              }`}
            >
              <Text
                className="font-cairo-regular text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
