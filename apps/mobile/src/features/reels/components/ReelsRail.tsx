import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { useReelsAvailable, useReelsRail } from '../hooks/useReelsQueries';
import ReelCard from './ReelCard';

/**
 * «ريلز» beside the stories on the home: the newest reels in a row, each
 * opening the full-screen feed. For guests too. Nothing at all while the
 * server's switch is off, or with no reels to show.
 */
export default function ReelsRail() {
  const router = useRouter();
  const available = useReelsAvailable();
  const { data, refetch } = useReelsRail(available);

  useFocusEffect(
    useCallback(() => {
      if (available) void refetch();
    }, [available, refetch]),
  );

  const reels = data?.reels ?? [];
  if (!available || reels.length === 0) return null;

  const open = (startId?: string) =>
    router.push({
      pathname: '/reels',
      params: startId ? { startId } : {},
    } as never);

  return (
    <View testID="reels-rail" className="pb-[16px]" style={{ gap: 10 }}>
      <View className="flex-row items-center justify-between">
        <Text className="font-cairo-bold text-[16px] leading-[24px] text-[#15304D]">
          ريلز
        </Text>
        <TouchableOpacity
          testID="reels-rail-all"
          onPress={() => open()}
          activeOpacity={0.7}
        >
          <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
            عرض الكل
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={reels}
        keyExtractor={(r) => r.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <ReelCard
            reel={item}
            authorName={item.author.name}
            onPress={() => open(item.id)}
          />
        )}
      />
    </View>
  );
}
