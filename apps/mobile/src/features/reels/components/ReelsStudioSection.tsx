import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

import StudioSection from '@/features/stories/studio/StudioSection';

import { useMyReels, useReelsAvailable } from '../hooks/useReelsQueries';
import ReelCard, { REEL_CARD_HEIGHT, REEL_CARD_WIDTH } from './ReelCard';

/**
 * «ريلز» in the studio: post a new one, and the profile's own with their views
 * and likes, each opening in the viewer (where it can be deleted). Nothing
 * while the server's switch is off.
 */
export default function ReelsStudioSection({
  identityId,
}: {
  identityId: string;
}) {
  const router = useRouter();
  const available = useReelsAvailable();
  const { data, refetch } = useMyReels(available);

  // Fresh after posting or deleting one
  useFocusEffect(
    useCallback(() => {
      if (available) void refetch();
    }, [available, refetch]),
  );

  if (!available) return null;

  return (
    <StudioSection title="ريلز" hint="فيديوهاتك القصيرة، تبقى حتى تحذفها">
      <ScrollView
        testID="studio-reels"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          testID="studio-reel-new"
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => router.push('/reels/new' as never)}
          className="items-center justify-center rounded-[14px] border border-dashed border-[#C5A36D] bg-[#FBF6EC]"
          style={{ width: REEL_CARD_WIDTH, height: REEL_CARD_HEIGHT, gap: 8 }}
        >
          <Feather name="plus-circle" size={26} color="#15304D" />
          <Text className="font-cairo-semibold text-[13px] leading-[20px] text-[#15304D]">
            فيديو جديد
          </Text>
        </TouchableOpacity>
        {(data?.reels ?? []).map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            showLikes
            onPress={() =>
              router.push({
                pathname: '/reels',
                params: { authorId: identityId, startId: reel.id },
              } as never)
            }
          />
        ))}
      </ScrollView>
    </StudioSection>
  );
}
