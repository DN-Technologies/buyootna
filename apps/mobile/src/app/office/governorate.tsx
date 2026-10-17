import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PropertyListItem from '@/shared/components/property/PropertyListItem';
import CompanyDetailSkeleton from '@/shared/components/skeletons/CompanyDetailSkeleton';
import ContentContainer from '@/shared/components/ui/ContentContainer';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';
import { useOfficeDetails } from '@/shared/hooks/providers/useOfficeDetails';
import { shareProperty } from '@/shared/utils/helpers/property';
import {
  governorateTitle,
  OFFICE_DEAL_TABS,
  type OfficeDeal,
  officeListingsFor,
} from '@/shared/utils/office/officeListings';

/**
 * One governorate's ads of an office (Figma 1258:121320), opened from the
 * profile's الاعلانات tab: بيع / ايجار / بدل tabs over the office's ads
 * there. Reads the office profile already loaded for the previous screen.
 */
export default function OfficeGovernorateScreen() {
  const router = useRouter();
  const { officeId, governorateId } = useLocalSearchParams<{
    officeId: string;
    governorateId: string;
  }>();
  const { properties, isLoading } = useOfficeDetails(officeId);
  const { favoritedIds, toggleFavorite } = useFavorites();
  const [deal, setDeal] = useState<OfficeDeal>('SALE');

  const listings = officeListingsFor(properties, governorateId ?? '', deal);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* Title bar: back, governorate */}
        <View className="h-[52px] flex-row items-center justify-between px-4">
          <TouchableOpacity
            testID="office-governorate-back"
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="h-8 w-8 items-center justify-center rounded-full"
          >
            <Feather name="chevron-right" size={22} color="#111111" />
          </TouchableOpacity>
          <Text
            numberOfLines={1}
            className="flex-1 text-center font-cairo-semibold text-[18px] leading-[26px] text-[#111111]"
          >
            {governorateTitle(governorateId ?? '')}
          </Text>
          <View className="h-8 w-8" />
        </View>

        {/* بيع / ايجار / بدل */}
        <View className="flex-row items-center border-b border-[#EBECEE] px-4" style={{ gap: 8 }}>
          {OFFICE_DEAL_TABS.map((tab) => {
            const active = tab.id === deal;
            return (
              <TouchableOpacity
                key={tab.id}
                testID={`office-deal-${tab.id}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                activeOpacity={0.8}
                onPress={() => setDeal(tab.id)}
                className="h-11 flex-1 items-center justify-between pt-[14px]"
              >
                <Text
                  className={`text-[15px] leading-[18px] ${
                    active ? 'font-almarai-bold text-[#15304D]' : 'font-almarai text-[#6B6A6A]'
                  }`}
                >
                  {tab.label}
                </Text>
                <View
                  className={`h-[2px] w-full rounded-t-[6px] ${
                    active ? 'bg-[#15304D]' : 'bg-transparent'
                  }`}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <CompanyDetailSkeleton />
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}
          >
            <Text
              testID="office-governorate-count"
              className="mb-3 font-cairo-medium text-[12px] leading-[16px] text-[#6B6A6A]"
            >
              {listings.length} عقارات
            </Text>

            {listings.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Feather name="folder" size={40} color="#CBD5E1" />
                <Text className="mt-3 font-cairo-semibold text-sm text-[#94A3B8]">
                  لا توجد إعلانات {OFFICE_DEAL_TABS.find((t) => t.id === deal)?.label} هنا
                </Text>
              </View>
            ) : (
              listings.map((item) => (
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
                  requestYear={deal === 'EXCHANGE' ? item.requestYear : null}
                  requiredYear={deal === 'EXCHANGE' ? item.requiredYear : null}
                  isFavorited={favoritedIds.includes(item.id)}
                  onFavorite={() => toggleFavorite(item.id)}
                  onPress={() => router.push(`/property/${item.id}`)}
                  onShowDetails={() => router.push(`/property/${item.id}`)}
                  onShare={() => shareProperty(item)}
                />
              ))
            )}
          </ScrollView>
        )}
      </ContentContainer>
    </SafeAreaView>
  );
}
