import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  CardsViewIcon,
  ListViewIcon,
  MapIcon,
} from '@/assets/icons/home/header';

type PrimaryTab = 'all' | 'properties' | 'offices';
type PropertyFilter = 'all' | 'exchange' | 'rent' | 'sale';

interface HomeFilterPillsProps {
  activeTab: PrimaryTab;
  activePropFilter: PropertyFilter;
  onPropFilterChange: (filter: PropertyFilter) => void;
  viewMode?: 'card' | 'list';
  onViewModeChange?: (mode: 'card' | 'list') => void;
}

function MapPillButton() {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/map')}
      className="flex-row gap-2 px-4 rounded-full border border-[#ECECEC] bg-[#F9FAFE] h-[32px] justify-center items-center"
    >
      <MapIcon size={18} color="#111111" />
      <Text className="font-cairo-medium text-[14px] leading-[24px] text-[#111111]">
        الخريطة
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeFilterPills({
  activeTab,
  activePropFilter,
  onPropFilterChange,
  viewMode = 'card',
  onViewModeChange,
}: HomeFilterPillsProps) {
  if (activeTab === 'offices') {
    return null;
  }

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
        <MapPillButton />
      </View>
    ) : null;
  }

  const propertyFilters: { id: PropertyFilter; label: string }[] = [
    { id: 'exchange', label: 'بدل' },
    { id: 'rent', label: 'إيجار' },
    { id: 'sale', label: 'بيع' },
  ];

  return (
    <View className="mb-4">
      {/* Filter Pills */}
      <View
        className="w-full flex-row gap-3"
        style={{ flexDirection: 'row-reverse' }}
      >
        {propertyFilters.map((filter) => {
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
          <MapPillButton />
        </View>
      )}
    </View>
  );
}
