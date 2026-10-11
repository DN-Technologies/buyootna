import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { FavoritesTab } from './FavoritesTabs';

interface FavoritesSubHeaderProps {
  activeTab: FavoritesTab;
  totalCount: number;
  // The list is still loading: a placeholder instead of "nothing saved"
  isLoading?: boolean;
  onSortPress: () => void;
}

export default function FavoritesSubHeader({
  activeTab,
  totalCount,
  isLoading = false,
  onSortPress,
}: FavoritesSubHeaderProps) {
  const getCountText = () => {
    if (totalCount === 0) return 'لا توجد عناصر محفوظة';
    switch (activeTab) {
      case 'properties':
        return `${totalCount} عقار`;
      case 'companies':
        return `${totalCount} شركة`;
      case 'offices':
        return `${totalCount} مكتب`;
      default:
        return `${totalCount}`;
    }
  };

  return (
    <View className="w-full flex-row items-center justify-between px-4 py-2">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSortPress}
        className="flex-row items-center gap-1 p-1"
      >
        <MaterialCommunityIcons
          name="sort-variant"
          size={18}
          color="#111111"
        />
        <Text className="font-cairo-medium text-sm leading-[22px] text-[#111111]">
          الترتيب حسب
        </Text>
      </TouchableOpacity>
      {isLoading ? (
        <View
          testID="favorites-count-skeleton"
          className="h-3.5 w-16 rounded-md bg-slate-100"
        />
      ) : (
        <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
          {getCountText()}
        </Text>
      )}
    </View>
  );
}
