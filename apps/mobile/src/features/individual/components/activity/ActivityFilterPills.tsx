import { ScrollView, Text, TouchableOpacity } from 'react-native';

export type ActivityFilterType =
  | 'ALL'
  | 'ACTIVE'
  | 'DRAFT'
  | 'PREMIUM'
  | 'ARCHIVED';

export interface FilterPill {
  id: ActivityFilterType;
  label: string;
}

interface ActivityFilterPillsProps {
  filterPills: FilterPill[];
  activeFilterId: ActivityFilterType;
  onFilterChange: (id: ActivityFilterType) => void;
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
      className="mb-4"
      contentContainerStyle={{ flexDirection: 'row-reverse' }}
    >
      {filterPills.map((pill) => {
        const isActive = activeFilterId === pill.id;

        return (
          <TouchableOpacity
            key={pill.id}
            onPress={() => onFilterChange(pill.id)}
            className={`mr-2 rounded-full border px-4 py-1.5 ${
              isActive
                ? 'border-[#B28648] bg-white'
                : 'border-gray-100 bg-[#F8FAFC]'
            }`}
          >
            <Text
              className={`text-[14px] ${
                isActive
                  ? 'font-cairo-bold text-[#111111]'
                  : 'font-cairo text-[#6B6A6A]'
              }`}
            >
              {pill.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
