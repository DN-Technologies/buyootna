import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type PrimaryTab = 'all' | 'properties' | 'companies';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';
type CompanyFilter =
  | 'all'
  | 'finishing'
  | 'transport'
  | 'building'
  | 'decorations'
  | 'interior_design'
  | 'other';

interface HomeFilterPillsProps {
  activeTab: PrimaryTab;
  activePropFilter: PropertyFilter;
  onPropFilterChange: (filter: PropertyFilter) => void;
  activeCompFilter: CompanyFilter;
  onCompFilterChange: (filter: CompanyFilter) => void;
}

export default function HomeFilterPills({
  activeTab,
  activePropFilter,
  onPropFilterChange,
  activeCompFilter,
  onCompFilterChange,
}: HomeFilterPillsProps) {
  if (activeTab === 'all') return null;

  const propertyFilters: { id: PropertyFilter; label: string }[] = [
    { id: 'sale', label: 'بيع' },
    { id: 'rent', label: 'إيجار' },
    { id: 'exchange', label: 'بدل' },
  ];

  const companyFilters: { id: CompanyFilter; label: string }[] = [
    { id: 'other', label: 'أخرى' },
    { id: 'decorations', label: 'ديكورات' },
    { id: 'interior_design', label: 'تصميم داخلي' },
    { id: 'building', label: 'بناء' },
    { id: 'transport', label: 'نقل' },
    { id: 'finishing', label: 'تشطيب' },
    { id: 'all', label: 'الكل' },
  ];

  const filters = activeTab === 'properties' ? propertyFilters : companyFilters;
  const isProperties = activeTab === 'properties';

  if (isProperties) {
    return (
      <View
        className="mb-4 w-full flex-row gap-3"
        style={{ flexDirection: 'row-reverse' }}
      >
        {filters.map((filter) => {
          const isActive = activePropFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.8}
              onPress={() => onPropFilterChange(filter.id as PropertyFilter)}
              className={`flex-1 items-center justify-center rounded-full border py-2 ${
                isActive
                  ? 'border-[#B28648] bg-white'
                  : 'border-[#F5F6F8] bg-[#F5F6F8]'
              }`}
            >
              <Text className="font-cairo-bold text-sm leading-[18px] text-[#111111]">
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{
          flexDirection: 'row-reverse',
          gap: 12,
        }}
      >
        {filters.map((filter) => {
          const isActive = activeCompFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.8}
              onPress={() => onCompFilterChange(filter.id as CompanyFilter)}
              className={`rounded-full border px-6 py-1 ${
                isActive
                  ? 'border-[#B28648] bg-white'
                  : 'border-[#F5F6F8] bg-[#F5F6F8]'
              }`}
            >
              <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
