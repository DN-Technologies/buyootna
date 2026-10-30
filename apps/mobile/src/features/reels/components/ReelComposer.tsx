import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import StoryCamera from '@/features/stories/components/camera/StoryCamera';
import ComposerPreview from '@/features/stories/components/composer/ComposerPreview';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';

import { useReelComposer } from '../hooks/useReelComposer';
import { REEL_VIDEO_MAX_MS } from '../reelRules';

/**
 * Posting a reel (companies and offices): the Stories camera and preview, for
 * video only and up to 60 seconds.
 */
export default function ReelComposer() {
  const c = useReelComposer();
  const listingSheet = useRef<BottomSheetModal>(null);

  if (!c.canPost) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-8">
        <Text className="text-center font-cairo-semibold text-[16px] text-white">
          {c.isBusiness
            ? 'حدّث التطبيق لنشر الفيديوهات'
            : 'نشر الفيديوهات متاح للشركات والمكاتب فقط'}
        </Text>
        <TouchableOpacity testID="reel-composer-close" onPress={c.close}>
          <Text className="font-cairo-semibold text-[14px] text-[#FFD084]">رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {c.media ? (
        <ComposerPreview
          media={c.media}
          canTrim
          trim={c.trim}
          onTrim={c.setTrim}
          muted={c.muted}
          onToggleMuted={() => c.setMuted(!c.muted)}
          caption={c.caption}
          onCaption={c.setCaption}
          linkedLabel={c.linkedLabel}
          onLink={() => listingSheet.current?.present()}
          onUnlink={c.unlink}
          preparing={c.preparing}
          progress={c.progress}
          onPublish={() => void c.publish()}
          onDiscard={c.clearMedia}
          maxMs={REEL_VIDEO_MAX_MS}
          publishLabel="نشر الفيديو"
        />
      ) : (
        <StoryCamera
          preparing={c.preparing}
          onCaptured={(media) => void c.acceptCaptured(media)}
          onPickLibrary={() => void c.pickFromLibrary()}
          onClose={c.close}
          maxMs={REEL_VIDEO_MAX_MS}
          videoOnly
        />
      )}

      <RadioSelectionSheet
        ref={listingSheet}
        title="ربط بإعلان"
        options={c.listingOptions}
        selectedValue={c.propertyId}
        onSelect={c.setPropertyId}
      />
    </KeyboardAvoidingView>
  );
}
