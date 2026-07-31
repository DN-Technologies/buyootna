import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import CategoryItem, { CategoryItemProps } from './CategoryItem';

interface ExploreSectionProps {
  title: string;
  items: CategoryItemProps[];
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export default function ExploreSection({
  title,
  items,
  showViewAll = false,
  onViewAllPress,
}: ExploreSectionProps) {
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-almarai-bold text-[16px] text-[#000]">
          {title}
        </Text>
        {showViewAll && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
              عرض الكل
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row flex-wrap gap-4">
        {items.map((item, index) => (
          <CategoryItem key={`${item.title}-${index}`} {...item} />
        ))}
      </View>
    </View>
  );
}
