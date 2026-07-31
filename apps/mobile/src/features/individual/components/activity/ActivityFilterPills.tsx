import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface FilterPill {
  id: 'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM';
  label: string;
}

interface ActivityFilterPillsProps {
  filterPills: FilterPill[];
  activeFilterId: 'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM';
  onFilterChange: (id: 'ALL' | 'ACTIVE' | 'DRAFT' | 'PREMIUM') => void;
}

export default function ActivityFilterPills({
  filterPills,
  activeFilterId,
  onFilterChange,
}: ActivityFilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6"
      contentContainerStyle={{ flexDirection: 'row-reverse' }}
    >
      {filterPills.map((pill) => (
        <TouchableOpacity
          key={pill.id}
          onPress={() => onFilterChange(pill.id)}
          className={`mr-2 rounded-full border px-4 py-1 ${
            activeFilterId === pill.id
              ? 'border-[#B28648] bg-[#F5F7F9]'
              : 'border-transparent bg-[#F5F7F9]'
          }`}
        >
          <Text className="font-cairo text-[14px] text-[#111111]">
            {pill.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
