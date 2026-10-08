import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { ChatProposal, LocalAttachment } from '@/shared/api/chat.service';
import { proposalPreview } from '@/shared/utils/chatProposals';

// Same limits as the API (ChatAttachmentsService)
export const MAX_CHAT_ATTACHMENTS = 10;
const MB = 1024 * 1024;
export const IMAGE_MAX_BYTES = 10 * MB;
export const FILE_MAX_BYTES = 20 * MB;
export const VIDEO_MAX_BYTES = 100 * MB;
export const AUDIO_MAX_BYTES = 10 * MB;
// A video tour: up to 2 minutes; a voice note: up to 5
export const VIDEO_MAX_SECONDS = 120;
export const VOICE_MAX_MS = 5 * 60 * 1000;
const MAX_BYTES = {
  IMAGE: IMAGE_MAX_BYTES,
  FILE: FILE_MAX_BYTES,
  VIDEO: VIDEO_MAX_BYTES,
  AUDIO: AUDIO_MAX_BYTES,
};

export const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const fromImageAsset = (a: ImagePicker.ImagePickerAsset): LocalAttachment => ({
  uri: a.uri,
  name: a.fileName || `photo-${Date.now()}.jpg`,
  mimeType: a.mimeType || 'image/jpeg',
  size: a.fileSize,
  kind: 'IMAGE',
});

/** Opens the camera; null when cancelled or not allowed. */
export async function takePhoto(): Promise<LocalAttachment[] | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets.map(fromImageAsset);
}

/** Picks up to `limit` photos from the gallery. */
export async function pickPhotos(
  limit = MAX_CHAT_ATTACHMENTS,
): Promise<LocalAttachment[] | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets.map(fromImageAsset);
}

/**
 * Picks one video (up to 2 minutes; iOS exports it as 720p H.264) and makes
 * its still image.
 */
export async function pickVideo(): Promise<LocalAttachment[] | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    videoMaxDuration: VIDEO_MAX_SECONDS,
    videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
    quality: 0.7,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  let thumbnailUri: string | undefined;
  try {
    thumbnailUri = (
      await VideoThumbnails.getThumbnailAsync(asset.uri, {
        time: 1000,
        quality: 0.6,
      })
    ).uri;
  } catch {
    // Sent without a still: the bubble shows a plain play tile
  }
  return [
    {
      uri: asset.uri,
      name: asset.fileName || `video-${Date.now()}.mp4`,
      mimeType: asset.mimeType || 'video/mp4',
      size: asset.fileSize,
      kind: 'VIDEO',
      durationMs: asset.duration ?? undefined,
      thumbnailUri,
    },
  ];
}

/** Picks PDF / Word / Excel documents. */
export async function pickDocuments(): Promise<LocalAttachment[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: DOCUMENT_TYPES,
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  return result.assets.map((a) => ({
    uri: a.uri,
    name: a.name,
    mimeType: a.mimeType || 'application/octet-stream',
    size: a.size,
    kind: 'FILE',
  }));
}

/** Why these files can't be sent, or null when they're fine. */
export function attachmentsProblem(files: LocalAttachment[]): string | null {
  if (files.length > MAX_CHAT_ATTACHMENTS) {
    return `يمكن إرسال ${MAX_CHAT_ATTACHMENTS} ملفات كحد أقصى في المرة الواحدة`;
  }
  for (const f of files) {
    const max = MAX_BYTES[f.kind];
    if (f.kind === 'VIDEO' && (f.durationMs ?? 0) > (VIDEO_MAX_SECONDS + 1) * 1000) {
      return `مدة الفيديو أطول من ${VIDEO_MAX_SECONDS / 60} دقيقة`;
    }
    if (f.size && f.size > max) {
      return `حجم ${f.name} أكبر من ${max / MB} ميجابايت`;
    }
    if (f.kind === 'FILE' && !DOCUMENT_TYPES.includes(f.mimeType)) {
      return 'نوع الملف غير مدعوم. المسموح: PDF و Word و Excel';
    }
  }
  return null;
}

/** "0:42" / "2:05". */
export function formatDuration(ms?: number | null): string {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** The message type for files sent together (same rule as the server). */
export function messageTypeFor(files: { kind: LocalAttachment['kind'] }[]) {
  if (files.some((f) => f.kind === 'AUDIO')) return 'VOICE' as const;
  if (files.some((f) => f.kind === 'VIDEO')) return 'VIDEO' as const;
  if (files.every((f) => f.kind === 'IMAGE')) return 'IMAGE' as const;
  return 'FILE' as const;
}

/** "1.2 MB" / "350 KB". */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Icon and colour for a document card. */
export function documentStyle(mimeType: string, fileName = '') {
  const name = fileName.toLowerCase();
  if (mimeType.includes('pdf') || name.endsWith('.pdf')) {
    return { label: 'PDF', color: '#DC2626' };
  }
  if (mimeType.includes('word') || /\.docx?$/.test(name)) {
    return { label: 'DOC', color: '#2563EB' };
  }
  if (mimeType.includes('excel') || mimeType.includes('sheet') || /\.xlsx?$/.test(name)) {
    return { label: 'XLS', color: '#16A34A' };
  }
  if (mimeType.startsWith('video/')) return { label: 'VIDEO', color: '#DC2626' };
  return { label: 'FILE', color: '#64748B' };
}

/** The chats list preview of a conversation's last message. */
export function lastMessagePreview(
  last: {
    type: string;
    content: string | null;
    attachmentsCount?: number;
    attachmentName?: string | null;
    attachmentDurationMs?: number | null;
    locationLabel?: string | null;
    // From a live message (socket) the pin comes as `location`
    location?: { label?: string | null } | null;
    proposal?: ChatProposal | null;
  } | null,
): string {
  if (!last) return 'بدء المحادثة';
  if (last.type === 'LOCATION') {
    const label = last.locationLabel ?? last.location?.label;
    return label ? `📍 ${label}` : '📍 موقع';
  }
  if (last.type === 'APPOINTMENT' || last.type === 'OFFER') {
    return proposalPreview(last.proposal, last.type);
  }
  if (last.type === 'VIDEO') return '🎥 فيديو';
  if (last.type === 'VOICE') {
    return last.attachmentDurationMs
      ? `🎤 رسالة صوتية (${formatDuration(last.attachmentDurationMs)})`
      : '🎤 رسالة صوتية';
  }
  const count = last.attachmentsCount ?? 0;
  if (last.type === 'FILE') return `📎 ${last.attachmentName || 'ملف'}`;
  if (last.type === 'IMAGE') return count > 1 ? `📷 ${count} صور` : '📷 صورة';
  if (last.type === 'PROPERTY') return '🏠 مشاركة عقار';
  return last.content || '';
}
