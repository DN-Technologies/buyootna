import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import OfficeGovernorateCard from '@/shared/components/office/OfficeGovernorateCard';
import PropertyCard from '@/shared/components/property/PropertyCard';
import PropertyListItem from '@/shared/components/property/PropertyListItem';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';
import { shareProperty } from '@/shared/utils/helpers/property';
import { groupByGovernorate } from '@/shared/utils/office/officeListings';
import { PropertyDto } from '@/types/feed';

interface OfficeListingsTabProps {
  properties?: PropertyDto[];
  onFilterPress?: () => void;
  // Opens one governorate's ads (Figma: الاعلانات groups by governorate)
  onOpenGovernorate?: (governorateId: string) => void;
}

export default function OfficeListingsTab({
  properties = [],
  onFilterPress,
  onOpenGovernorate,
}: OfficeListingsTabProps) {
  const router = useRouter();
  const { favoritedIds, toggleFavorite } = useFavorites();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  if (properties.length === 0) {
    return (
      <View className="items-center justify-center py-12">
        <Feather name="folder" size={40} color="#CBD5E1" />
        <Text className="mt-3 font-cairo-semibold text-sm text-[#94A3B8]">
          لا توجد إعلانات حالياً لهذا المكتب
        </Text>
      </View>
    );
  }

  // One card per governorate (Figma 1258:120961). An API that doesn't send
  // the deal type yet gets the plain list below.
  if (onOpenGovernorate && properties.some((item) => item.listingType)) {
    return (
      <View className="flex-1 pb-24" style={{ gap: 8 }}>
        {groupByGovernorate(properties).map((group) => (
          <OfficeGovernorateCard
            key={group.governorateId}
            group={group}
            onPress={() => onOpenGovernorate(group.governorateId)}
          />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 pb-24">
      {/* Controls: View Mode Switcher & Filter */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1 rounded-xl bg-[#F5F7F9] p-1">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('list')}
            className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
              viewMode === 'list' ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          >
            <Feather
              name="list"
              color={viewMode === 'list' ? '#FFFFFF' : '#6B6A6A'}
              size={14}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setViewMode('card')}
            className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
              viewMode === 'card' ? 'bg-[#15304D]' : 'bg-transparent'
            }`}
          >
            <Feather
              name="grid"
              color={viewMode === 'card' ? '#FFFFFF' : '#6B6A6A'}
              size={14}
            />
          </TouchableOpacity>
        </View>

        {onFilterPress && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onFilterPress}
            className="flex-row items-center gap-1.5"
          >
            <Feather name="sliders" size={16} color="#6B6A6A" />
            <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
              تصفية
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Property Items List */}
      <View className="space-y-4">
        {properties.map((item) =>
          viewMode === 'card' ? (
            <PropertyCard
              key={item.id}
              {...item}
              isFavorited={favoritedIds.includes(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/property/${item.id}`)}
              onShare={() => shareProperty(item)}
            />
          ) : (
            <PropertyListItem
              key={item.id}
              id={item.id}
              price={item.price}
              companyName={item.companyName}
              isFeatured={item.isFeatured}
              categoryLabel={item.categoryLabel}
              beds={item.beds}
              area={item.area}
              location={item.location}
              propertyIncome={item.propertyIncome}
              requestYear={item.requestYear}
              requiredYear={item.requiredYear}
              isFavorited={favoritedIds.includes(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/property/${item.id}`)}
              onShowDetails={() => router.push(`/property/${item.id}`)}
              onShare={() => shareProperty(item)}
            />
          ),
        )}
      </View>
    </View>
  );
}
