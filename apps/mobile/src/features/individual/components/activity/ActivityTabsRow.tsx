import { Text, TouchableOpacity, View } from 'react-native';

import { SortingIcon } from '@/assets/icons/activity';
import { FilterHorizontalIcon } from '@/assets/icons/home/header';

export interface ActivityTab<T extends string = string> {
  id: T;
  label: string;
}

interface ActivityTabsRowProps<T extends string> {
  tabs: ActivityTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
}

export default function ActivityTabsRow<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  onFilterPress,
  onSortPress,
}: ActivityTabsRowProps<T>) {
  return (
    <View className="mb-4 flex-row items-center gap-2 px-5">
      {/* Tab Pill Container */}
      <View className="h-[45px] flex-1 flex-row items-center justify-between rounded-full border border-gray-100 bg-[#F8FAFC] px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className="h-full flex-1 items-center justify-center rounded-full"
              activeOpacity={0.7}
            >
              <View className="items-center justify-center">
                <Text
                  className={`${
                    isActive
                      ? 'font-cairo-bold text-[#15304D]'
                      : 'font-cairo text-[#6B6A6A]'
                  } text-sm leading-[22px]`}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-[-10px] h-[2px] w-[80%] rounded-full bg-[#15304D]" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onFilterPress}
        className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
      >
        <FilterHorizontalIcon size={18} color="#111111" />
      </TouchableOpacity>

      {/* Sort Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSortPress}
        className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
      >
        <SortingIcon size={18} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
