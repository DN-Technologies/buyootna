import { Feather } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { getInfoAsync } from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { storiesService } from '@/shared/api/stories.service';
import { userService } from '@/shared/api/user.service';
import RadioSelectionSheet from '@/shared/components/profile/RadioSelectionSheet';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { showAlert } from '@/shared/utils/alert';
import { showPermissionDenied } from '@/shared/utils/permissionDenied';

import { useActiveIdentityId } from '../hooks/useStoriesQueries';
import {
  publishStory,
  type StoryMedia,
  storyPublishErrorMessage,
} from '../publishStory';
import {
  STORY_CAPTION_MAX,
  STORY_POSTER_MAX_BYTES,
  STORY_VIDEO_MAX_MS,
  storyPhotoProblem,
  storyPhotoType,
  storyVideoProblem,
  storyVideoType,
} from '../storyPhoto';

const NO_LISTING = 'none';
const VIDEO_MAX_SECONDS = STORY_VIDEO_MAX_MS / 1000;

const sizeOf = async (uri: string, reported?: number | null) => {
  if (reported) return reported;
  const info = await getInfoAsync(uri);
  return info.exists ? info.size : undefined;
};

/**
 * The video's still, as a JPEG within the poster limit (made again at a
 * lower quality if the first is too big); null if it can't be made.
 */
async function makePoster(uri: string): Promise<{ uri: string; sizeBytes: number } | null> {
  for (const quality of [0.7, 0.4]) {
    try {
      const still = await VideoThumbnails.getThumbnailAsync(uri, { time: 0, quality });
      const size = await sizeOf(still.uri);
      if (size && size <= STORY_POSTER_MAX_BYTES) return { uri: still.uri, sizeBytes: size };
    } catch {
      return null;
    }
  }
  return null;
}

const VIDEO_PROBLEMS = {
  type: 'نوع الفيديو غير مدعوم (MP4 أو MOV)',
  size: 'حجم الفيديو يتجاوز 50 ميجابايت',
  length: 'مدة الفيديو تتجاوز 30 ثانية',
} as const;

/**
 * Posting a story (companies and offices): pick or take a media or a video
 * of up to 30 seconds, add a caption and optionally one of your active
 * listings, then publish.
 */
export default function StoryComposer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isBusiness } = useIdentity();
  const identityId = useActiveIdentityId();
  const listingSheet = useRef<BottomSheetModal>(null);

  const [media, setMedia] = useState<StoryMedia | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [caption, setCaption] = useState('');
  const [propertyId, setPropertyId] = useState<string>(NO_LISTING);
  const [progress, setProgress] = useState<number | null>(null);

  const listings = useQuery({
    queryKey: ['stories', identityId, 'my-listings'],
    queryFn: () => userService.getUserProperties(identityId ?? ''),
    enabled: isBusiness && !!identityId,
  });
  const listingOptions = [
    { value: NO_LISTING, label: 'بدون إعلان' },
    ...(listings.data ?? []).map((p) => ({
      value: p.id,
      label: [p.categoryLabel ?? p.type, p.location].filter(Boolean).join(' · '),
    })),
  ];
  const linked = listingOptions.find((o) => o.value === propertyId);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const acceptVideo = async (asset: ImagePicker.ImagePickerAsset) => {
    const type = storyVideoType(asset.mimeType, asset.uri);
    const size = await sizeOf(asset.uri, asset.fileSize);
    const problem = storyVideoProblem(type, size, asset.duration);
    if (problem || !type || !size) {
      showAlert('تنبيه', VIDEO_PROBLEMS[problem ?? 'type']);
      return;
    }
    setPreparing(true);
    const poster = await makePoster(asset.uri);
    setPreparing(false);
    if (!poster) {
      showAlert('تنبيه', 'تعذر تجهيز الفيديو، اختر فيديو آخر');
      return;
    }
    setMedia({
      kind: 'VIDEO',
      uri: asset.uri,
      type,
      sizeBytes: size,
      durationMs: asset.duration ?? null,
      poster,
    });
  };

  const acceptAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    if (asset.type === 'video') {
      await acceptVideo(asset);
      return;
    }
    const type = storyPhotoType(asset.mimeType, asset.uri);
    const size = await sizeOf(asset.uri, asset.fileSize);
    const problem = storyPhotoProblem(type, size);
    if (problem || !type || !size) {
      showAlert(
        'تنبيه',
        problem === 'size'
          ? 'حجم الصورة يتجاوز 10 ميجابايت'
          : 'نوع الصورة غير مدعوم (JPEG أو PNG أو WebP)',
      );
      return;
    }
    setMedia({ kind: 'IMAGE', uri: asset.uri, type, sizeBytes: size });
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      // iOS: hand over a JPEG rather than HEIC, and a 720p H.264 video
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      videoMaxDuration: VIDEO_MAX_SECONDS,
      videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
    });
    if (!result.canceled && result.assets[0]) await acceptAsset(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showPermissionDenied('camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      videoMaxDuration: VIDEO_MAX_SECONDS,
    });
    if (!result.canceled && result.assets[0]) await acceptAsset(result.assets[0]);
  };

  const publish = async () => {
    if (!media || progress !== null) return;
    setProgress(0);
    try {
      await publishStory(
        storiesService,
        media,
        {
          caption,
          propertyId: propertyId === NO_LISTING ? undefined : propertyId,
        },
        setProgress,
      );
      close();
    } catch (error) {
      if (!handleSubscriptionRequired(error, router)) {
        showAlert('تعذر نشر القصة', storyPublishErrorMessage(error));
      }
    } finally {
      setProgress(null);
    }
  };

  if (!isBusiness) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-black px-8">
        <StatusBar style="light" />
        <Text className="text-center font-cairo-semibold text-[16px] text-white">
          نشر القصص متاح للشركات والمكاتب فقط
        </Text>
        <TouchableOpacity testID="composer-close" onPress={close}>
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
      {media && (
        <Image
          testID="composer-preview"
          // A video is previewed by its poster
          source={{ uri: media.kind === 'VIDEO' ? media.poster.uri : media.uri }}
          contentFit="contain"
          cachePolicy="memory"
          style={StyleSheet.absoluteFill}
        />
      )}
      {media?.kind === 'VIDEO' && (
        <View
          testID="composer-video-badge"
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="size-16 items-center justify-center rounded-full bg-black/50">
            <Feather name="video" size={28} color="#FFFFFF" />
          </View>
          {media.durationMs ? (
            <Text className="mt-2 font-cairo-semibold text-[13px] text-white">
              {Math.round(media.durationMs / 1000)} ث
            </Text>
          ) : null}
        </View>
      )}

      <View
        className="flex-row items-center justify-between px-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          testID="composer-close"
          onPress={close}
          accessibilityLabel="إغلاق"
          className="size-10 items-center justify-center rounded-full bg-black/40"
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        {media && (
          <TouchableOpacity
            testID="composer-change"
            onPress={() => setMedia(null)}
            className="h-10 justify-center rounded-full bg-black/40 px-4"
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              {media.kind === 'VIDEO' ? 'تغيير الفيديو' : 'تغيير الصورة'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!media ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-cairo-semibold text-[18px] text-white">قصة جديدة</Text>
          <Text className="text-center font-cairo-medium text-[13px] text-white/70">
            صورة، أو فيديو حتى 30 ثانية
          </Text>
          {preparing && <ActivityIndicator testID="composer-preparing" color="#FFFFFF" />}
          <TouchableOpacity
            testID="composer-pick-library"
            disabled={preparing}
            onPress={() => void pickFromLibrary()}
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full bg-white"
          >
            <Feather name="image" size={18} color="#15304D" />
            <Text className="font-cairo-semibold text-[14px] text-[#15304D]">اختر من المعرض</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="composer-take-photo"
            disabled={preparing}
            onPress={() => void takePhoto()}
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full border border-white/60"
          >
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text className="font-cairo-semibold text-[14px] text-white">الكاميرا</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View className="flex-1" />
          <View
            className="gap-3 bg-black/50 px-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <View>
              <TextInput
                testID="composer-caption"
                value={caption}
                onChangeText={setCaption}
                placeholder="أضف وصفاً (اختياري)"
                placeholderTextColor="#BDBDBD"
                maxLength={STORY_CAPTION_MAX}
                multiline
                className="max-h-24 font-cairo-medium text-[14px] text-white"
                style={{ writingDirection: 'rtl', textAlign: 'right' }}
              />
              <Text testID="composer-caption-count" className="font-cairo-medium text-[11px] text-white/60">
                {caption.length}/{STORY_CAPTION_MAX}
              </Text>
            </View>
            <TouchableOpacity
              testID="composer-listing"
              onPress={() => listingSheet.current?.present()}
              className="h-11 flex-row items-center gap-2 rounded-full border border-white/40 px-4"
            >
              <Feather name="home" size={16} color="#FFFFFF" />
              <Text numberOfLines={1} className="flex-1 font-cairo-medium text-[13px] text-white">
                {propertyId === NO_LISTING ? 'ربط بإعلان (اختياري)' : linked?.label}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="composer-publish"
              onPress={() => void publish()}
              disabled={progress !== null}
              className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#15304D]"
            >
              {progress !== null ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text testID="composer-progress" className="font-cairo-semibold text-[14px] text-white">
                    {Math.round(progress * 100)}%
                  </Text>
                </>
              ) : (
                <Text className="font-cairo-semibold text-[14px] text-white">نشر القصة</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <RadioSelectionSheet
        ref={listingSheet}
        title="ربط بإعلان"
        options={listingOptions}
        selectedValue={propertyId}
        onSelect={setPropertyId}
      />
    </KeyboardAvoidingView>
  );
}
