import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { CardsViewIcon, ListViewIcon } from '@/assets/icons/home/header';

type PrimaryTab = 'all' | 'properties' | 'companies';
type PropertyFilter = 'all' | 'exchange' | 'rent' | 'sale';
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
  viewMode?: 'card' | 'list';
  onViewModeChange?: (mode: 'card' | 'list') => void;
}

export default function HomeFilterPills({
  activeTab,
  activePropFilter,
  onPropFilterChange,
  activeCompFilter,
  onCompFilterChange,
  viewMode = 'card',
  onViewModeChange,
}: HomeFilterPillsProps) {
  if (activeTab === 'all') {
    return onViewModeChange ? (
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 rounded-xl bg-[#F5F7F9] p-1">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onViewModeChange('list')}
            className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
              viewMode === 'list' ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          >
            <ListViewIcon
              color={viewMode === 'list' ? '#FFFFFF' : '#6B6A6A'}
              size={14}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onViewModeChange('card')}
            className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
              viewMode === 'card' ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          >
            <CardsViewIcon
              color={viewMode === 'card' ? '#FFFFFF' : '#6B6A6A'}
              size={14}
            />
          </TouchableOpacity>
        </View>
      </View>
    ) : null;
  }

  const propertyFilters: { id: PropertyFilter; label: string }[] = [
    { id: 'exchange', label: 'بدل' },
    { id: 'rent', label: 'إيجار' },
    { id: 'sale', label: 'بيع' },
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
      <View className="mb-4">
        {/* Filter Pills */}
        <View
          className="w-full flex-row gap-3"
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

        {/* View Mode Toggle Row */}
        {onViewModeChange && (
          <View className="mt-3 flex-row items-center justify-between">
            {/* Right: View Mode Toggle */}
            <View className="flex-row items-center gap-1 rounded-xl bg-[#F5F7F9] p-1">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onViewModeChange('list')}
                className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                  viewMode === 'list' ? 'bg-[#15304D]' : 'bg-transparent'
                }`}
              >
                <ListViewIcon
                  color={viewMode === 'list' ? '#FFFFFF' : '#6B6A6A'}
                  size={14}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onViewModeChange('card')}
                className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                  viewMode === 'card' ? 'bg-[#15304D]' : 'bg-transparent'
                }`}
              >
                <CardsViewIcon
                  color={viewMode === 'card' ? '#FFFFFF' : '#6B6A6A'}
                  size={14}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
