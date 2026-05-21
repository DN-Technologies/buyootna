import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type PrimaryTab = 'all' | 'properties' | 'companies';
type PropertyFilter = 'all' | 'sale' | 'rent' | 'exchange';
type CompanyFilter = 'all' | 'finishing' | 'transport' | 'building' | 'other';

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
    { id: 'all', label: 'الكل' },
    { id: 'sale', label: 'بيع' },
    { id: 'rent', label: 'إيجار' },
    { id: 'exchange', label: 'بدل' },
  ];

  const companyFilters: { id: CompanyFilter; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'finishing', label: 'تشطيب' },
    { id: 'transport', label: 'نقل' },
    { id: 'building', label: 'بناء' },
    { id: 'other', label: 'أخرى' },
  ];

  const filters = activeTab === 'properties' ? propertyFilters : companyFilters;

  return (
    <View className="mb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        // Adding right-to-left scrolling behavior
        contentContainerStyle={{
          paddingRight: 5,
          flexDirection: 'row-reverse',
        }}
      >
        {filters.map((filter) => {
          const isActive =
            activeTab === 'properties'
              ? activePropFilter === filter.id
              : activeCompFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.8}
              onPress={() =>
                activeTab === 'properties'
                  ? onPropFilterChange(filter.id as PropertyFilter)
                  : onCompFilterChange(filter.id as CompanyFilter)
              }
              className={`ml-1 mr-2 rounded-full border px-6 py-2 ${
                isActive ? 'border-[#15304D] bg-[#15304D]' : 'border-gray-300 bg-white'
              }`}
            >
              <Text
                className={`font-cairo-bold text-sm ${
                  isActive ? 'text-white' : 'text-[#6B6A6A]'
                }`}
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
