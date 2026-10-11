import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAlertMatches } from '@/features/individual/hooks/useAlertMatches';
import { useMyAlerts } from '@/features/individual/hooks/useMyAlerts';
import { getAlertTitle } from '@/features/individual/utils/alertCard';
import PropertyListItem from '@/shared/components/property/PropertyListItem';
import PropertyListSkeleton from '@/shared/components/skeletons/PropertyListSkeleton';
import { useFavorites } from '@/shared/hooks/properties/useFavorites';

export default function AlertMatchesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: matches, isLoading, isRefetching, error, refetch } =
    useAlertMatches(id);
  const { data: alerts } = useMyAlerts();
  const { isFavorited, toggleFavorite } = useFavorites();

  const alert = alerts.find((a) => a.id === id);
  const title = alert ? getAlertTitle(alert).title : 'العقارات المطابقة';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="w-8">
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          className="flex-1 text-center font-cairo-semibold text-lg leading-[24px] text-[#111111]"
        >
          {title}
        </Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        <View className="px-5 pt-4">
          {[1, 2, 3].map((key) => (
            <PropertyListSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlashList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#15304D"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center px-6 pt-24">
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-[#15304D]/5">
                <Feather name="bell" size={32} color="#15304D" />
              </View>
              <Text className="mb-2 text-center font-cairo-bold text-lg text-[#111111]">
                {error ? 'حدث خطأ' : 'لا توجد عقارات مطابقة حالياً'}
              </Text>
              <Text className="text-center font-cairo-medium text-sm text-[#6B6A6A]">
                {error ?? 'سنرسل لك إشعاراً عند نشر عقار يطابق هذا التنبيه.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PropertyListItem
              id={item.id}
              price={item.price}
              companyName={item.companyName}
              isFeatured={item.isFeatured}
              categoryLabel={item.categoryLabel}
              beds={item.beds}
              area={item.area}
              location={item.location}
              propertyIncome={item.propertyIncome}
              isFavorited={isFavorited(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onPress={() => router.push(`/property/${item.id}` as any)}
              onShowDetails={() => router.push(`/property/${item.id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
