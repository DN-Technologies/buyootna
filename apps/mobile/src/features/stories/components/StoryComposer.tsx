import { Feather } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { getInfoAsync } from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
  type StoryPhoto,
  storyPublishErrorMessage,
} from '../publishStory';
import {
  STORY_CAPTION_MAX,
  storyPhotoProblem,
  storyPhotoType,
} from '../storyPhoto';

const NO_LISTING = 'none';

/**
 * Posting a photo story (companies and offices): pick or take a photo,
 * add a caption and optionally one of your active listings, then publish.
 */
export default function StoryComposer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isBusiness } = useIdentity();
  const identityId = useActiveIdentityId();
  const listingSheet = useRef<BottomSheetModal>(null);

  const [photo, setPhoto] = useState<StoryPhoto | null>(null);
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

  const acceptAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const type = storyPhotoType(asset.mimeType, asset.uri);
    let size = asset.fileSize;
    if (!size) {
      const info = await getInfoAsync(asset.uri);
      size = info.exists ? info.size : undefined;
    }
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
    setPhoto({ uri: asset.uri, type, sizeBytes: size });
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      // iOS: hand over a JPEG rather than HEIC
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
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
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) await acceptAsset(result.assets[0]);
  };

  const publish = async () => {
    if (!photo || progress !== null) return;
    setProgress(0);
    try {
      await publishStory(
        storiesService,
        photo,
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
      {photo && (
        <Image
          testID="composer-preview"
          source={{ uri: photo.uri }}
          contentFit="contain"
          cachePolicy="memory"
          style={StyleSheet.absoluteFill}
        />
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
        {photo && (
          <TouchableOpacity
            testID="composer-change"
            onPress={() => setPhoto(null)}
            className="h-10 justify-center rounded-full bg-black/40 px-4"
          >
            <Text className="font-cairo-semibold text-[14px] text-white">تغيير الصورة</Text>
          </TouchableOpacity>
        )}
      </View>

      {!photo ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-cairo-semibold text-[18px] text-white">قصة جديدة</Text>
          <TouchableOpacity
            testID="composer-pick-library"
            onPress={() => void pickFromLibrary()}
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full bg-white"
          >
            <Feather name="image" size={18} color="#15304D" />
            <Text className="font-cairo-semibold text-[14px] text-[#15304D]">اختر من المعرض</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="composer-take-photo"
            onPress={() => void takePhoto()}
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-full border border-white/60"
          >
            <Feather name="camera" size={18} color="#FFFFFF" />
            <Text className="font-cairo-semibold text-[14px] text-white">التقط صورة</Text>
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
