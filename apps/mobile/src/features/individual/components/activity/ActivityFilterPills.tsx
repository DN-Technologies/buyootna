import { ScrollView, Text, TouchableOpacity } from 'react-native';

export type ActivityFilterType =
  | 'ALL'
  | 'ACTIVE'
  | 'DRAFT'
  | 'PREMIUM'
  | 'ARCHIVED';

export interface FilterPill<T extends string = ActivityFilterType> {
  id: T;
  label: string;
}

interface ActivityFilterPillsProps<T extends string> {
  filterPills: FilterPill<T>[];
  activeFilterId: T;
  onFilterChange: (id: T) => void;
  // 'tag': the Figma "tag" chips of عروضي (32px, #F5F7F9, gold border when active)
  variant?: 'default' | 'tag';
}

// Shared by the ads filters and the offers (طلبات) status pills
export default function ActivityFilterPills<T extends string = ActivityFilterType>({
  filterPills,
  activeFilterId,
  onFilterChange,
  variant = 'default',
}: ActivityFilterPillsProps<T>) {
  if (variant === 'tag') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 9 }}
        style={{ marginBottom: 15, flexGrow: 0 }}
      >
        {filterPills.map((pill) => {
          const isActive = activeFilterId === pill.id;
          return (
            <TouchableOpacity
              key={pill.id}
              testID={`filter-pill-${pill.id}`}
              onPress={() => onFilterChange(pill.id)}
              activeOpacity={0.8}
              className="h-8 items-center justify-center rounded-[16px] bg-[#F5F7F9] px-[14px]"
              style={{
                borderWidth: 1.2,
                borderColor: isActive ? '#B28648' : 'transparent',
              }}
            >
              <Text
                className="font-cairo text-[14px] text-[#111111]"
                style={{ letterSpacing: -0.408 }}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      // No row-reverse: the app is forced RTL, so the row already starts on
      // the right. Reversing it again pushed the last pill (مؤرشفة)
      // off-screen where it couldn't be scrolled to.
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
