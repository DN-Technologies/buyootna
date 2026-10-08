import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { favoritesService } from '@/shared/api/favorites.service';
import { useMyActivity } from '@/shared/hooks/useMyActivity';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

/** What the picked ad's card shows until the server's copy arrives. */
export interface PickedProperty {
  id: string;
  imageUrl: string;
  price: number | null;
  title: string;
  type: string;
  location: string;
}

interface PropertyPickerSheetProps {
  onClose: () => void;
  onPick: (property: PickedProperty) => void;
}

type Tab = 'MINE' | 'FAVORITES';

/** 🏠 Share one of my live ads or a favourite. */
export default function PropertyPickerSheet({ onClose, onPick }: PropertyPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('MINE');
  const [q, setQ] = useState('');

  const mine = useMyActivity('ACTIVE');
  const favorites = useQuery({
    queryKey: ['favorites', 'chat-share'],
    queryFn: () => favoritesService.getFavorites(1, 50),
    enabled: tab === 'FAVORITES',
  });

  const items: PickedProperty[] = useMemo(() => {
    const list =
      tab === 'MINE'
        ? // Hidden ads aren't public
          mine.data.filter((p) => !p.isHidden).map((p) => ({
            id: p.id,
            images: p.images,
            price: p.price,
            type: p.type,
            category: p.category,
            location: p.location ?? '',
          }))
        : (favorites.data?.data ?? []).map((p) => ({
            id: p.id,
            images: p.images,
            price: p.price,
            type: p.type,
            category: p.category,
            location: p.location,
          }));
    return list.map((p) => ({
      id: p.id,
      imageUrl: p.images?.[0] ?? '',
      price: p.price,
      title: `${getArabicCategoryLabel(p.category)} ${getArabicTypeLabel(p.type)}`.trim(),
      type: p.type,
      location: p.location,
    }));
  }, [tab, mine.data, favorites.data]);

  const query = q.trim();
  const shown = query
    ? items.filter((p) => p.title.includes(query) || p.location.includes(query))
    : items;
  const loading = tab === 'MINE' ? mine.isLoading : favorites.isLoading;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity testID="property-picker-close" onPress={onClose} className="p-1">
            <Feather name="x" size={22} color="#111111" />
          </TouchableOpacity>
          <Text className="font-cairo-bold text-base text-[#111111]">مشاركة عقار</Text>
          <View className="w-8" />
        </View>

        <View className="flex-row border-b border-gray-100 px-4">
          {(
            [
              ['MINE', 'إعلاناتي'],
              ['FAVORITES', 'المفضلة'],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              testID={`property-picker-tab-${key}`}
              onPress={() => setTab(key)}
              className={`border-b-2 px-4 pb-3 ${tab === key ? 'border-[#15304D]' : 'border-transparent'}`}
            >
              <Text className={`font-cairo-bold text-[14px] ${tab === key ? 'text-[#15304D]' : 'text-[#94A3B8]'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mx-4 my-3 flex-row items-center rounded-xl bg-[#F9FAFE] px-3">
          <Feather name="search" size={16} color="#94A3B8" />
          <TextInput
            testID="property-picker-search"
            value={q}
            onChangeText={setQ}
            placeholder="ابحث بالنوع أو المنطقة..."
            placeholderTextColor="#94A3B8"
            className="flex-1 px-2 py-2.5 text-right font-cairo text-[14px] text-[#111111]"
          />
        </View>

        {loading ? (
          <ActivityIndicator className="mt-10" color="#15304D" />
        ) : (
          <FlatList
            data={shown}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
            ListEmptyComponent={
              <Text className="py-10 text-center font-cairo text-[14px] text-[#94A3B8]">
                {tab === 'MINE' ? 'لا توجد إعلانات نشطة' : 'لا توجد عقارات في المفضلة'}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                testID={`property-picker-item-${item.id}`}
                onPress={() => onPick(item)}
                className="flex-row items-center gap-3 border-b border-gray-50 py-3"
              >
                <Image
                  source={
                    item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/no-image.png')
                  }
                  style={{ width: 64, height: 64, borderRadius: 8 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text className="font-cairo-bold text-[14px] text-[#111111]">{item.title}</Text>
                  {!!item.price && (
                    <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
                      {formatNumber(item.price)} د.ك
                    </Text>
                  )}
                  {!!item.location && (
                    <Text numberOfLines={1} className="font-cairo text-[12px] text-[#6B6A6A]">
                      {item.location}
                    </Text>
                  )}
                </View>
                <Feather name="send" size={18} color="#15304D" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
