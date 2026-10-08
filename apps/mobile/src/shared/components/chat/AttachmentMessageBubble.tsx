import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '@/shared/api/chat.service';
import { documentStyle, formatFileSize } from '@/shared/utils/chatAttachments';

interface AttachmentMessageBubbleProps {
  message: ChatMessage;
  timestamp: string;
  quote?: ReactNode;
  // Opens the viewer over this message's photos, at `index`
  onPressPhoto: (index: number) => void;
  onPressFile: (index: number) => void;
  onRetry?: () => void;
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
  onRetry,
}: AttachmentMessageBubbleProps) {
  const isMine = message.isMine;
  const pending = !message.attachments && !!message.localAttachments;
  const items = message.attachments
    ? message.attachments.map((a) => ({
        kind: a.kind,
        uri: a.url,
        name: a.fileName,
        mimeType: a.mimeType,
        size: a.size,
      }))
    : (message.localAttachments ?? []).map((a) => ({
        kind: a.kind,
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
      }));
  const photos = items.filter((i) => i.kind === 'IMAGE');
  const files = items.filter((i) => i.kind === 'FILE');
  const shownPhotos = photos.slice(0, 4);
  const extra = photos.length - shownPhotos.length;
  const tile = photos.length === 1 ? GRID : (GRID - 4) / 2;

  return (
    <View
      className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}
    >
      <View
        testID="attachment-bubble"
        className={`max-w-[80%] rounded-md p-1.5 ${
          isMine ? 'rounded-br-none bg-[#F9FAFE]' : 'rounded-bl-none bg-[#15304D]'
        }`}
      >
        {quote && <View className="px-1 pt-1">{quote}</View>}

        {shownPhotos.length > 0 && (
          <View className="flex-row flex-wrap gap-1" style={{ width: GRID }}>
            {shownPhotos.map((p, i) => (
              <TouchableOpacity
                key={`${p.uri}-${i}`}
                testID={`attachment-photo-${i}`}
                activeOpacity={0.9}
                disabled={pending}
                onPress={() => onPressPhoto(i)}
                style={{ width: tile, height: tile }}
                className="overflow-hidden rounded-md bg-gray-200"
              >
                <Image
                  source={{ uri: p.uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
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

        {files.map((f, i) => {
          const style = documentStyle(f.mimeType, f.name);
          return (
            <TouchableOpacity
              key={`${f.uri}-${i}`}
              testID={`attachment-file-${i}`}
              activeOpacity={0.8}
              disabled={pending}
              onPress={() => onPressFile(i)}
              className={`mt-1 flex-row items-center gap-2.5 rounded-md px-2.5 py-2 ${
                isMine ? 'bg-white' : 'bg-white/10'
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
                    isMine ? 'text-[#111111]' : 'text-white'
                  }`}
                >
                  {f.name}
                </Text>
                {!!f.size && (
                  <Text
                    className={`font-cairo text-[11px] ${
                      isMine ? 'text-[#6B6A6A]' : 'text-white/70'
                    }`}
                  >
                    {formatFileSize(f.size)}
                  </Text>
                )}
              </View>
              {!pending && (
                <Feather
                  name="download"
                  size={16}
                  color={isMine ? '#15304D' : '#FFFFFF'}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {!!message.content && (
          <Text
            className={`px-2 pt-1.5 text-right font-cairo-medium text-[14px] leading-6 ${
              isMine ? 'text-[#111111]' : 'text-white'
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
            <ActivityIndicator size="small" color={isMine ? '#15304D' : '#FFFFFF'} />
            <Text className={`font-cairo text-[12px] ${isMine ? 'text-[#6B6A6A]' : 'text-white/80'}`}>
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
      <Text className="mt-1 self-end px-1 font-cairo text-[13px] text-[#6B6A6A]">
        {timestamp}
      </Text>
    </View>
  );
}
