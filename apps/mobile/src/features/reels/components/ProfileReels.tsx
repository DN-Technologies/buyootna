import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';

import { useAuthorReelsRail, useReelsAvailable } from '../hooks/useReelsQueries';
import ReelCard from './ReelCard';

/**
 * A company's or office's reels on its profile, opening in the viewer with
 * only its reels. Keeps reels the main feed hides (a sold listing, a lapsed
 * subscription). Nothing while the switch is off, or with no reels.
 */
export default function ProfileReels({ authorId }: { authorId?: string }) {
  const router = useRouter();
  const available = useReelsAvailable();
  const { data, refetch } = useAuthorReelsRail(authorId, available);

  useFocusEffect(
    useCallback(() => {
      if (available && authorId) void refetch();
    }, [authorId, available, refetch]),
  );

  const reels = data?.reels ?? [];
  if (!available || !authorId || reels.length === 0) return null;

  return (
    <View testID="profile-reels" className="mt-4" style={{ gap: 10 }}>
      <Text className="font-cairo-bold text-[16px] leading-[24px] text-[#15304D]">
        ريلز
      </Text>
      <FlatList
        horizontal
        data={reels}
        keyExtractor={(r) => r.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <ReelCard
            reel={item}
            onPress={() =>
              router.push({
                pathname: '/reels',
                params: { authorId, startId: item.id },
              } as never)
            }
          />
        )}
      />
    </View>
  );
}
