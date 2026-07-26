import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FilterTabsState,
  isTabDirty,
  useFilterStore,
} from '@/core/store/useFilterStore';

export interface FilterFooterProps {
  activeTab: keyof FilterTabsState;
  onApplyFilters: (filterData: any) => void;
}

export default function FilterFooter({
  activeTab,
  onApplyFilters,
}: FilterFooterProps) {
  const insets = useSafeAreaInsets();

  // Connect to Zustand to trigger actions based on the active tab
  const resetTab = useFilterStore((state) => state.resetTab);
  const activeTabData = useFilterStore((state) => state[activeTab]);

  // Check if the current tab has any filters set (different from initial)
  const hasFilters = isTabDirty(activeTab, activeTabData);

  const handleReset = () => {
    resetTab(activeTab);
  };

  const handleSubmit = () => {
    if (!hasFilters) return;
    // Pass the deeply nested, perfectly typed JSON state to the parent
    onApplyFilters({
      tab: activeTab,
      filters: activeTabData,
    });
  };

  return (
    <View
      className="w-full border-t border-gray-100 bg-white px-5 pt-4"
      style={{ paddingBottom: Math.max(0, insets.bottom - 20) }}
    >
      <View className="flex-row items-center justify-between gap-4">
        {/* --- Reset Button (إعادة التعيين) --- */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleReset}
          className="items-center justify-center px-4 py-3"
        >
          <Text className="font-cairo-semibold text-sm leading-[20px] text-[#15304D]">
            إعادة التعيين
          </Text>
        </TouchableOpacity>

        {/* --- Submit Button (عرض النتائج) --- */}
        <TouchableOpacity
          activeOpacity={hasFilters ? 0.7 : 1}
          onPress={handleSubmit}
          disabled={!hasFilters}
          className="h-[48px] flex-1 items-center justify-center rounded-[24px] py-4"
          style={{ backgroundColor: hasFilters ? '#15304D' : '#A6A6A6' }}
        >
          <Text className="font-cairo-semibold text-sm leading-[20px] text-white">
            عرض النتائج
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
