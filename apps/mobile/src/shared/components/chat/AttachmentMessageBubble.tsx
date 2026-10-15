import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import MessageMeta from '@/shared/components/chat/MessageMeta';
import {
  documentStyle,
  formatDuration,
  formatFileSize,
  readableFileName,
} from '@/shared/utils/chatAttachments';
import { cachedImageSource, stableMediaKey } from '@/shared/utils/chatMediaCache';
import { MessageStatus } from '@/shared/utils/chatReceipts';

interface AttachmentMessageBubbleProps {
  message: ChatMessage;
  timestamp: string;
  quote?: ReactNode;
  // Opens the viewer over this message's photos, at `index`
  onPressPhoto: (index: number) => void;
  onPressFile: (index: number) => void;
  onPressVideo?: (index: number) => void;
  onRetry?: () => void;
  status?: MessageStatus | null;
}

const GRID = 232;

/**
 * Photos (1 large, 2-4 in a grid, more with "+N") and/or documents, with an
 * optional caption. While sending it shows the picked files with upload
 * progress; a failed send offers a retry.
 */
export default function AttachmentMessageBubble({
  message,
  timestamp,
  quote,
  onPressPhoto,
  onPressFile,
  onPressVideo,
  onRetry,
  status,
}: AttachmentMessageBubbleProps) {
  const isMine = message.isMine;
  // My bubbles are navy, theirs light: colours follow the background
  const onLight = !isMine;
  const pending = !message.attachments && !!message.localAttachments;
  const items = message.attachments
    ? message.attachments.map((a) => ({
        kind: a.kind,
        uri: a.url,
        name: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
        thumbnail: a.thumbnailUrl,
        durationMs: a.durationMs,
      }))
    : (message.localAttachments ?? []).map((a) => ({
        kind: a.kind,
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        thumbnail: a.thumbnailUri,
        durationMs: a.durationMs,
      }));
  const videos = items.filter((i) => i.kind === 'VIDEO');
  const photos = items.filter((i) => i.kind === 'IMAGE');
  const files = items.filter((i) => i.kind === 'FILE');
  const shownPhotos = photos.slice(0, 4);
  const extra = photos.length - shownPhotos.length;
  const tile = photos.length === 1 ? GRID : (GRID - 4) / 2;

  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View className={`max-w-[80%] ${isMine ? 'items-start' : 'items-end'}`}>
      <View
        testID="attachment-bubble"
        className={`rounded-md p-1.5 ${
          isMine ? 'rounded-br-none bg-[#15304D]' : 'rounded-bl-none bg-[#F9FAFE]'
        }`}
      >
        {quote && <View className="px-1 pt-1">{quote}</View>}

        {shownPhotos.length > 0 && (
          <View className="flex-row flex-wrap gap-1" style={{ width: GRID }}>
            {shownPhotos.map((p, i) => (
              <TouchableOpacity
                // Not the link itself: it is re-signed on every load, and a
                // changing key redrew every photo
                key={`${stableMediaKey(p.uri)}-${i}`}
                testID={`attachment-photo-${i}`}
                activeOpacity={0.9}
                disabled={pending}
                onPress={() => onPressPhoto(i)}
                style={{ width: tile, height: tile }}
                className="overflow-hidden rounded-md bg-gray-200"
              >
                <Image
                  source={cachedImageSource(p.uri)}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                {i === shownPhotos.length - 1 && extra > 0 && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <Text className="font-cairo-bold text-xl text-white">
                      +{extra}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {videos.map((v, i) => (
          <TouchableOpacity
            key={`${stableMediaKey(v.uri)}-${i}`}
            testID={`attachment-video-${i}`}
            activeOpacity={0.9}
            disabled={pending}
            onPress={() => onPressVideo?.(i)}
            style={{ width: GRID, height: 150 }}
            className="mt-1 items-center justify-center overflow-hidden rounded-md bg-[#0F172A]"
          >
            {!!v.thumbnail && (
              <Image
                source={cachedImageSource(v.thumbnail)}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            )}
            <View className="h-12 w-12 items-center justify-center rounded-full bg-black/50">
              <Feather name="play" size={22} color="#FFFFFF" />
            </View>
            {!!v.durationMs && (
              <View className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5">
                <Text className="font-cairo text-[11px] text-white">
                  {formatDuration(v.durationMs)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {files.map((f, i) => {
          const style = documentStyle(f.mimeType, f.name);
          return (
            <TouchableOpacity
              key={`${stableMediaKey(f.uri)}-${i}`}
              testID={`attachment-file-${i}`}
              activeOpacity={0.8}
              // Never disabled: while it uploads, the sender opens the copy
              // on their own phone (QA: a sent file could not be opened)
              onPress={() => onPressFile(i)}
              className={`mt-1 flex-row items-center gap-2.5 rounded-md px-2.5 py-2 ${
                onLight ? 'bg-white' : 'bg-white/10'
              }`}
              style={{ width: GRID }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: `${style.color}1A` }}
              >
                <Text className="font-cairo-bold text-[11px]" style={{ color: style.color }}>
                  {style.label}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className={`font-cairo-semibold text-[13px] ${
                    onLight ? 'text-[#111111]' : 'text-white'
                  }`}
                >
                  {readableFileName(f.name)}
                </Text>
                {!!f.size && (
                  <Text
                    className={`font-cairo text-[11px] ${
                      onLight ? 'text-[#6B6A6A]' : 'text-white/70'
                    }`}
                  >
                    {formatFileSize(f.size)}
                  </Text>
                )}
              </View>
              {/* Only on a file that was received: the sender already has
                  theirs (QA: their own file showed a download icon) */}
              {!pending && !isMine && (
                <Feather
                  testID={`attachment-file-download-${i}`}
                  name="download"
                  size={16}
                  color={onLight ? '#15304D' : '#FFFFFF'}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {!!message.content && (
          <Text
            className={`px-2 pt-1.5 text-right font-cairo-medium text-[14px] leading-6 ${
              onLight ? 'text-[#111111]' : 'text-white'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            {message.content}
          </Text>
        )}

        {/* Upload progress / failed send */}
        {pending && message.sending && (
          <View
            testID="attachment-uploading"
            className="flex-row items-center gap-1.5 px-2 pt-1.5"
          >
            <ActivityIndicator size="small" color={onLight ? '#15304D' : '#FFFFFF'} />
            <Text className={`font-cairo text-[12px] ${onLight ? 'text-[#6B6A6A]' : 'text-white/80'}`}>
              {`جاري الإرسال ${Math.round((message.uploadProgress ?? 0) * 100)}%`}
            </Text>
          </View>
        )}
        {message.failed && (
          <TouchableOpacity
            testID="attachment-retry"
            onPress={onRetry}
            className="flex-row items-center gap-1.5 px-2 pt-1.5"
          >
            <Feather name="rotate-cw" size={14} color="#DC2626" />
            <Text className="font-cairo-semibold text-[12px] text-[#DC2626]">
              تعذر الإرسال · إعادة المحاولة
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Under the bubble, on its side (it sat beside it, at the bottom) */}
      <MessageMeta timestamp={timestamp} status={status} />
      </View>
    </View>
  );
}
