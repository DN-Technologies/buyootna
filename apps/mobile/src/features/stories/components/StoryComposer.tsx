import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';

import ComposerPreview from './composer/ComposerPreview';
import ComposerStart from './composer/ComposerStart';
import { useStoryComposer } from './composer/useStoryComposer';

/**
 * Posting a story (companies and offices): «اضف قصة جديدة», then the photo
 * or video with its caption, listing and (video) trim, then send.
 */
export default function StoryComposer() {
  const c = useStoryComposer();
  const listingSheet = useRef<BottomSheetModal>(null);

  if (!c.isBusiness) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-8">
        <StatusBar style="light" />
        <Text className="text-center font-cairo-semibold text-[16px] text-white">
          نشر القصص متاح للشركات والمكاتب فقط
        </Text>
        <TouchableOpacity testID="composer-close" onPress={c.close}>
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
      <StatusBar style="light" />
      {c.media ? (
        <ComposerPreview
          media={c.media}
          canTrim={c.canTrim}
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
        />
      ) : (
        <ComposerStart
          preparing={c.preparing}
          onPickLibrary={() => void c.pickFromLibrary()}
          onTakePhoto={() => void c.takePhoto()}
          onClose={c.close}
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
