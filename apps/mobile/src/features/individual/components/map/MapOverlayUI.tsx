import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterHorizontalIcon } from '@/assets/icons/home/header';
import SelectionDrawer, {
  type SelectionItem,
} from '@/shared/components/filters/SelectionDrawer';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

const CATEGORIES = ['بيع', 'ايجار', 'بدل', 'شركات'];

interface MapOverlayUIProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedGovernorate: SelectionItem | null;
  selectedArea: SelectionItem | null;
  onGovernorateChange: (item: SelectionItem | null) => void;
  onAreaChange: (item: SelectionItem | null) => void;
  onOpenFilters: () => void;
}

export default function MapOverlayUI({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  selectedGovernorate,
  selectedArea,
  onGovernorateChange,
  onAreaChange,
  onOpenFilters,
}: MapOverlayUIProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const govDrawerRef = useRef<any>(null);
  const areaDrawerRef = useRef<any>(null);

  const areasToDisplay = useMemo(() => {
    if (!selectedGovernorate) {
      return Object.values(AREAS).flat();
    }
    return AREAS[selectedGovernorate.id] || [];
  }, [selectedGovernorate]);

  return (
    <View className="pointer-events-box-none absolute left-0 right-0 top-0 z-10">
      <View
        className="pointer-events-auto border-b border-gray-100 bg-white pb-3.5 shadow-sm shadow-gray-100/50"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <View className="flex-row items-center gap-2 px-5 py-1.5">
          {/* List View / Stack Layers Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/')}
            className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
          >
            <Feather name="layers" size={20} color="#111111" />
          </TouchableOpacity>

          {/* Tab Pill Container */}
          <View className="h-[45px] flex-1 flex-row items-center justify-between rounded-full border border-gray-100 bg-[#F8FAFC] px-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => onCategoryChange(cat)}
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
                      {cat}
                    </Text>
                    {isActive && (
                      <View className="absolute bottom-[-10px] h-[2px] w-12 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenFilters}
            className="h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-100 bg-[#F8FAFC]"
          >
            <FilterHorizontalIcon size={18} color="#111111" />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center justify-between gap-3 px-5">
          {/* Governorate Dropdown (Left) */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5"
            onPress={() => govDrawerRef.current?.present()}
          >
            <Text
              className={`font-cairo-medium text-[13px] ${
                selectedGovernorate ? 'text-[#111111]' : 'text-[#64748B]'
              }`}
            >
              {selectedGovernorate?.label ?? 'المحافظة'}
            </Text>
            <Feather name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>

          {/* Area Dropdown (Right) */}
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5"
            onPress={() => areaDrawerRef.current?.present()}
          >
            <Text
              className={`font-cairo-medium text-[13px] ${
                selectedArea ? 'text-[#111111]' : 'text-[#64748B]'
              }`}
            >
              {selectedArea?.label ?? 'المنطقة'}
            </Text>
            <Feather name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <SelectionDrawer
        ref={govDrawerRef}
        title="اختر المحافظة"
        data={GOVERNORATES}
        selectedItem={selectedGovernorate}
        onSelect={(item) => {
          onGovernorateChange(item);
          govDrawerRef.current?.dismiss();
        }}
      />

      <SelectionDrawer
        ref={areaDrawerRef}
        title="اختر المنطقة"
        data={areasToDisplay}
        selectedItem={selectedArea}
        onSelect={(item) => {
          onAreaChange(item);
          areaDrawerRef.current?.dismiss();
        }}
      />
    </View>
  );
}
