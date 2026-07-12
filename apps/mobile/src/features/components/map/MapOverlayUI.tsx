import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FilterHorizontalIcon,
  HomeSearchIcon,
  ListViewIcon,
} from '@/assets/icons/home/header';

const CATEGORIES = ['بيع', 'ايجار', 'بدل', 'شركات'];

interface MapOverlayUIProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onOpenFilters: () => void;
}

export default function MapOverlayUI({
  activeCategory,
  onCategoryChange,
  onOpenFilters,
}: MapOverlayUIProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      // pointer-events-box-none ensures the transparent parts of this view let touches pass through to the map
      className="pointer-events-box-none absolute left-0 right-0 top-0 z-10"
    >
      {/* Pinned top white panel covering the full width */}
      <View
        className="pointer-events-auto border-b border-gray-100 bg-white pb-3.5 shadow-sm shadow-gray-100/50"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        {/* --- 1. Search Bar, Filter Button & List View Toggle --- */}
        <View className="flex-row items-center justify-between gap-3 px-5 py-1.5">
          {/* List Icon Button (Right in RTL - navigates back to Home Feed) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/')}
            className="h-10 w-10 items-center justify-center"
          >
            <ListViewIcon size={22} color="#111111" />
          </TouchableOpacity>

          {/* Search Input (Middle in RTL) */}
          <View className="h-10 flex-1 flex-row items-center rounded-full border border-gray-100 bg-[#F8FAFC] px-4">
            <TextInput
              placeholder="ابحث عن عقار أو خدمة..."
              placeholderTextColor="#94A3B8"
              className="mr-2 flex-1 py-0 text-right font-cairo-medium text-[13px] text-[#111111]"
              textAlign="right"
            />
            <HomeSearchIcon size={18} color="#94A3B8" />
          </View>

          {/* Filter Button (Left in RTL - circular bordered button) */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenFilters}
            className="h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white"
          >
            <FilterHorizontalIcon size={18} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* --- 2. Category Tabs --- */}
        <View className="mt-2 flex-row justify-between border-b border-gray-50 px-5">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => onCategoryChange(cat)}
              className={`border-b-2 px-1 pb-2 ${
                activeCategory === cat
                  ? 'border-[#15304D]'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`font-cairo-bold text-[14px] ${
                  activeCategory === cat ? 'text-[#15304D]' : 'text-[#64748B]'
                }`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- 3. Dropdowns Row --- */}
        <View className="mt-3 flex-row items-center justify-between gap-3 px-5">
          {/* Governorate Dropdown (Right in RTL) */}
          <TouchableOpacity className="flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Text className="font-cairo-medium text-[13px] text-[#64748B]">
              المحافظة
            </Text>
            <Feather name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>

          {/* Area Dropdown (Left in RTL) */}
          <TouchableOpacity className="flex-1 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Text className="font-cairo-medium text-[13px] text-[#64748B]">
              المنطقة
            </Text>
            <Feather name="chevron-down" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
