import { useQuery } from '@tanstack/react-query';
import { getInfoAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useState } from 'react';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import { storiesService } from '@/shared/api/stories.service';
import { userService } from '@/shared/api/user.service';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { showAlert } from '@/shared/utils/alert';
import { showPermissionDenied } from '@/shared/utils/permissionDenied';

import { useActiveIdentityId } from '../../hooks/useStoriesQueries';
import {
  publishStory,
  type StoryMedia,
  storyPublishErrorMessage,
} from '../../publishStory';
import {
  STORY_POSTER_MAX_BYTES,
  STORY_VIDEO_MAX_MS,
  storyPhotoProblem,
  storyPhotoType,
  storyVideoProblem,
  storyVideoType,
} from '../../storyPhoto';
import {
  getVideoEditor,
  initialTrim,
  needsTrim,
  STORY_SOURCE_VIDEO_MAX_MS,
  type TrimRange,
} from '../../videoEditor';
import type { CapturedStoryMedia } from '../camera/useStoryCamera';

export const NO_LISTING = 'none';
const VIDEO_MAX_SECONDS = STORY_VIDEO_MAX_MS / 1000;

export const sizeOf = async (uri: string, reported?: number | null) => {
  if (reported) return reported;
  const info = await getInfoAsync(uri);
  return info.exists ? info.size : undefined;
};

/**
 * The video's still, as a JPEG within the poster limit (made again at a
 * lower quality if the first is too big); null if it can't be made.
 */
export async function makePoster(
  uri: string,
): Promise<{ uri: string; sizeBytes: number } | null> {
  for (const quality of [0.7, 0.4]) {
    try {
      const still = await VideoThumbnails.getThumbnailAsync(uri, {
        time: 0,
        quality,
      });
      const size = await sizeOf(still.uri);
      if (size && size <= STORY_POSTER_MAX_BYTES) {
        return { uri: still.uri, sizeBytes: size };
      }
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
const PREPARE_FAILED = 'تعذر تجهيز الفيديو، اختر فيديو آخر';

/**
 * Posting a story (companies and offices): pick or take a photo or a video,
 * cut the video to 30 seconds or less (and drop its sound) where the app
 * has the trimmer, add a caption and optionally one of your active
 * listings, then publish.
 */
export function useStoryComposer() {
  const router = useRouter();
  const { isBusiness } = useIdentity();
  const identityId = useActiveIdentityId();
  // Null on app builds from before the trimmer
  const editor = getVideoEditor();

  const [media, setMedia] = useState<StoryMedia | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [caption, setCaption] = useState('');
  const [propertyId, setPropertyId] = useState<string>(NO_LISTING);
  const [progress, setProgress] = useState<number | null>(null);
  // The video's kept part and sound (trimmer only)
  const [trim, setTrim] = useState<TrimRange>(initialTrim(null));
  const [muted, setMuted] = useState(false);

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
  const linkedLabel =
    propertyId === NO_LISTING
      ? null
      : (listingOptions.find((o) => o.value === propertyId)?.label ?? null);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/');

  const acceptVideo = async (asset: ImagePicker.ImagePickerAsset) => {
    const type = storyVideoType(asset.mimeType, asset.uri);
    const size = await sizeOf(asset.uri, asset.fileSize);
    const durationMs = asset.duration ?? null;
    if (editor) {
      // Any size and up to 10 minutes: it's cut down before upload
      if (!type || !size) {
        showAlert('تنبيه', VIDEO_PROBLEMS.type);
        return;
      }
      if (durationMs && durationMs > STORY_SOURCE_VIDEO_MAX_MS) {
        showAlert('تنبيه', 'الفيديو طويل جداً، اختر فيديو أقصر من 10 دقائق');
        return;
      }
    } else {
      const problem = storyVideoProblem(type, size, durationMs);
      if (problem || !type || !size) {
        showAlert('تنبيه', VIDEO_PROBLEMS[problem ?? 'type']);
        return;
      }
    }
    setPreparing(true);
    const poster = await makePoster(asset.uri);
    setPreparing(false);
    if (!poster) {
      showAlert('تنبيه', PREPARE_FAILED);
      return;
    }
    setTrim(initialTrim(durationMs));
    setMuted(false);
    setMedia({
      kind: 'VIDEO',
      uri: asset.uri,
      type: type!,
      sizeBytes: size!,
      durationMs,
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
      // With the trimmer, a longer video is cut down here instead
      ...(editor ? {} : { videoMaxDuration: VIDEO_MAX_SECONDS }),
      videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
    });
    if (!result.canceled && result.assets[0]) await acceptAsset(result.assets[0]);
  };

  /**
   * From the in-app camera: the same checks, poster and trimmer as a pick
   * from the gallery. The file's extension gives its type (iOS records
   * .mov, Android .mp4).
   */
  const acceptCaptured = async (captured: CapturedStoryMedia) => {
    await acceptAsset(
      captured.kind === 'photo'
        ? {
            uri: captured.uri,
            type: 'image',
            width: captured.width,
            height: captured.height,
            mimeType: 'image/jpeg',
          }
        : {
            uri: captured.uri,
            type: 'video',
            width: 0,
            height: 0,
            duration: captured.durationMs,
          },
    );
  };

  // The system camera: only on app builds without the in-app one
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showPermissionDenied('camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      videoMaxDuration: editor ? STORY_SOURCE_VIDEO_MAX_MS / 1000 : VIDEO_MAX_SECONDS,
    });
    if (!result.canceled && result.assets[0]) await acceptAsset(result.assets[0]);
  };

  /** The video cut to its kept part (and sound), ready to upload. */
  const preparedVideo = async (
    video: Extract<StoryMedia, { kind: 'VIDEO' }>,
  ): Promise<StoryMedia | null> => {
    if (!editor || !needsTrim(video, trim, muted)) return video;
    try {
      const out = await editor.trimVideo(video.uri, { ...trim, muted });
      const problem = storyVideoProblem('video/mp4', out.sizeBytes, out.durationMs);
      if (problem) {
        showAlert('تنبيه', VIDEO_PROBLEMS[problem]);
        return null;
      }
      const poster = await makePoster(out.uri);
      if (!poster) {
        showAlert('تنبيه', PREPARE_FAILED);
        return null;
      }
      return {
        kind: 'VIDEO',
        uri: out.uri,
        type: 'video/mp4',
        sizeBytes: out.sizeBytes,
        durationMs: out.durationMs,
        poster,
      };
    } catch {
      showAlert('تنبيه', PREPARE_FAILED);
      return null;
    }
  };

  const publish = async () => {
    if (!media || progress !== null || preparing) return;
    let ready: StoryMedia | null = media;
    if (media.kind === 'VIDEO') {
      setPreparing(true);
      ready = await preparedVideo(media);
      setPreparing(false);
      if (!ready) return;
    }
    setProgress(0);
    try {
      await publishStory(
        storiesService,
        ready,
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

  return {
    isBusiness,
    canTrim: !!editor,
    media,
    clearMedia: () => setMedia(null),
    preparing,
    caption,
    setCaption,
    propertyId,
    setPropertyId,
    listingOptions,
    linkedLabel,
    unlink: () => setPropertyId(NO_LISTING),
    trim,
    setTrim,
    muted,
    setMuted,
    progress,
    pickFromLibrary,
    acceptCaptured,
    takePhoto,
    publish,
    close,
  };
}

export type StoryComposerState = ReturnType<typeof useStoryComposer>;
