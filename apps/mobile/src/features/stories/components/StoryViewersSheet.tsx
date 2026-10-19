import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { VerifiedBadgeIcon } from '@/assets/icons/activity';
import { formatTimeAgo } from '@/shared/utils/helpers/time';

import { useStoryViewers } from '../hooks/useStoriesQueries';
import type { StoryViewerEntry } from '../types';

interface StoryViewersSheetProps {
  storyId: string | null;
  onClose?: () => void;
}

function ViewerRow({ viewer }: { viewer: StoryViewerEntry }) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-2.5">
      <View className="size-11 items-center justify-center overflow-hidden rounded-full bg-[#DEE3E8]">
        {viewer.avatarUrl ? (
          <Image
            source={{ uri: viewer.avatarUrl }}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text className="font-cairo-bold text-[16px] text-[#15304D]">
            {viewer.name.trim().charAt(0)}
          </Text>
        )}
      </View>
      <View className="flex-1 flex-row items-center gap-1">
        <Text
          numberOfLines={1}
          className="shrink font-cairo-semibold text-[14px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {viewer.name}
        </Text>
        {viewer.isVerified && <VerifiedBadgeIcon size={14} />}
      </View>
      <Text className="font-cairo-medium text-[12px] text-[#6B6A6A]">
        {formatTimeAgo(viewer.viewedAt)}
      </Text>
    </View>
  );
}

/** المشاهدون: who viewed one of the author's stories, newest first. */
const StoryViewersSheet = forwardRef<BottomSheetModal, StoryViewersSheetProps>(
  ({ storyId, onClose }, ref) => {
    const snapPoints = useMemo(() => ['60%'], []);
    const { viewers, total, isLoading, hasNextPage, fetchNextPage } =
      useStoryViewers(storyId);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
      >
        <View className="flex-row items-center justify-between px-4 pb-2">
          <Text testID="viewers-title" className="font-cairo-semibold text-[16px] text-[#111111]">
            المشاهدون · {total}
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator className="mt-6" color="#15304D" />
        ) : (
          <BottomSheetFlatList
            data={viewers}
            keyExtractor={(v: StoryViewerEntry) => v.identityId}
            renderItem={({ item }: { item: StoryViewerEntry }) => <ViewerRow viewer={item} />}
            onEndReached={() => {
              if (hasNextPage) void fetchNextPage();
            }}
            ListEmptyComponent={
              <Text className="mt-6 text-center font-cairo-medium text-[14px] text-[#6B6A6A]">
                لا مشاهدات بعد
              </Text>
            }
          />
        )}
      </BottomSheetModal>
    );
  },
);

StoryViewersSheet.displayName = 'StoryViewersSheet';

export default StoryViewersSheet;
