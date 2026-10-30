import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { handleSubscriptionRequired } from '@/features/company/utils/subscriptionRequired';
import type { CapturedStoryMedia } from '@/features/stories/components/camera/useStoryCamera';
import {
  makePoster,
  NO_LISTING,
  sizeOf,
} from '@/features/stories/components/composer/useStoryComposer';
import type { StoryMedia } from '@/features/stories/publishStory';
import { storyVideoType } from '@/features/stories/storyPhoto';
import {
  getVideoEditor,
  initialTrim,
  STORY_SOURCE_VIDEO_MAX_MS,
  type TrimRange,
} from '@/features/stories/videoEditor';
import { reelsService } from '@/shared/api/reels.service';
import { userService } from '@/shared/api/user.service';
import { useIdentity } from '@/shared/hooks/auth/useIdentity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

import { publishReel, reelPublishErrorMessage } from '../publishReel';
import { REEL_VIDEO_MAX_MS, reelVideoProblem } from '../reelRules';

type VideoMedia = Extract<StoryMedia, { kind: 'VIDEO' }>;

const PREPARE_FAILED = 'تعذر تجهيز الفيديو، اختر فيديو آخر';
const NOT_A_VIDEO = 'نوع الفيديو غير مدعوم (MP4 أو MOV)';
const TOO_LONG_SOURCE = 'الفيديو طويل جداً، اختر فيديو أقصر من 10 دقائق';
const PROBLEMS = {
  size: 'حجم الفيديو يتجاوز 50 ميجابايت، اختر جزءاً أقصر',
  length: 'مدة الفيديو تتجاوز 60 ثانية',
} as const;

/**
 * Posting a reel (companies and offices): take or pick a video, keep up to 60
 * seconds, add a caption and optionally one of your active listings, publish.
 * Every reel goes through the trimmer, even one that needs no cut, so the feed
 * only ever has 720p H.264 MP4s that start fast on mobile data.
 */
export function useReelComposer() {
  const router = useRouter();
  const { isBusiness } = useIdentity();
  const identityId = useAuthStore((s) => s.activeIdentity?.id ?? null);
  // Null only on builds before 1.6.0, which no longer get updates
  const editor = getVideoEditor();

  const [media, setMedia] = useState<VideoMedia | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [caption, setCaption] = useState('');
  const [propertyId, setPropertyId] = useState<string>(NO_LISTING);
  const [progress, setProgress] = useState<number | null>(null);
  const [trim, setTrim] = useState<TrimRange>(
    initialTrim(null, REEL_VIDEO_MAX_MS),
  );
  const [muted, setMuted] = useState(false);

  const listings = useQuery({
    queryKey: ['reels', identityId, 'my-listings'],
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
    router.canGoBack() ? router.back() : router.replace('/reels' as never);

  const acceptVideo = async (
    uri: string,
    mimeType: string | null | undefined,
    reportedSize: number | null | undefined,
    durationMs: number | null,
  ) => {
    const type = storyVideoType(mimeType, uri);
    const size = await sizeOf(uri, reportedSize);
    if (!type || !size) {
      showAlert('تنبيه', NOT_A_VIDEO);
      return;
    }
    if (durationMs && durationMs > STORY_SOURCE_VIDEO_MAX_MS) {
      showAlert('تنبيه', TOO_LONG_SOURCE);
      return;
    }
    setPreparing(true);
    const poster = await makePoster(uri);
    setPreparing(false);
    if (!poster) {
      showAlert('تنبيه', PREPARE_FAILED);
      return;
    }
    setTrim(initialTrim(durationMs, REEL_VIDEO_MAX_MS));
    setMuted(false);
    setMedia({ kind: 'VIDEO', uri, type, sizeBytes: size, durationMs, poster });
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      // iOS: hand over a 720p H.264 video
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (asset) {
      await acceptVideo(
        asset.uri,
        asset.mimeType,
        asset.fileSize,
        asset.duration ?? null,
      );
    }
  };

  const acceptCaptured = async (captured: CapturedStoryMedia) => {
    if (captured.kind !== 'video') return;
    await acceptVideo(captured.uri, null, null, captured.durationMs);
  };

  /** The kept part, exported as the feed's format, ready to upload. */
  const exported = async (video: VideoMedia) => {
    if (!editor) return null;
    try {
      const out = await editor.trimVideo(video.uri, { ...trim, muted });
      const problem = reelVideoProblem(out.sizeBytes, out.durationMs);
      if (problem) {
        showAlert('تنبيه', PROBLEMS[problem]);
        return null;
      }
      const poster = await makePoster(out.uri);
      if (!poster) {
        showAlert('تنبيه', PREPARE_FAILED);
        return null;
      }
      return { uri: out.uri, sizeBytes: out.sizeBytes, poster };
    } catch {
      showAlert('تنبيه', PREPARE_FAILED);
      return null;
    }
  };

  const publish = async () => {
    if (!media || progress !== null || preparing) return;
    setPreparing(true);
    const ready = await exported(media);
    setPreparing(false);
    if (!ready) return;
    setProgress(0);
    try {
      await publishReel(
        reelsService,
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
        showAlert('تعذر نشر الفيديو', reelPublishErrorMessage(error));
      }
    } finally {
      setProgress(null);
    }
  };

  return {
    canPost: isBusiness && !!editor,
    isBusiness,
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
    publish,
    close,
  };
}
