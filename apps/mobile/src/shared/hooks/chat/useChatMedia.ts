import { useState } from 'react';

import { ChatAttachment, chatService } from '@/shared/api/chat.service';
import { useImageViewer } from '@/shared/components/media/ImageViewer';

/**
 * Opening what a chat holds: its images full screen (swipe, pinch /
 * double-tap to zoom) and its videos in the player.
 */
export function useChatMedia(messages: readonly object[]) {
  const { open: openViewer, viewer } = useImageViewer();
  // The chat video being played full screen
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // The conversation's images, oldest first, at the tapped one
  const openImage = (imageUrl: string) => {
    const urls = messages
      .filter(
        (m) =>
          'type' in m && m.type === 'IMAGE' && 'imageUrl' in m && !!m.imageUrl,
      )
      .map((m) => (m as { imageUrl: string }).imageUrl);
    openViewer(urls, Math.max(0, urls.indexOf(imageUrl)));
  };

  const openPhotos = (urls: string[], index: number) => openViewer(urls, index);

  const openVideo = async (video: Pick<ChatAttachment, 'id' | 'url'>) => {
    // A fresh link: the one in the message may have expired
    try {
      setVideoUrl(await chatService.attachmentUrl(video.id));
    } catch {
      setVideoUrl(video.url);
    }
  };

  return {
    viewer,
    openImage,
    openPhotos,
    videoUrl,
    openVideo,
    closeVideo: () => setVideoUrl(null),
  };
}
