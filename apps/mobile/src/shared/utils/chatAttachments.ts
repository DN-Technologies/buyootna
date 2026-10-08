import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { LocalAttachment } from '@/shared/api/chat.service';

// Same limits as the API (ChatAttachmentsService)
export const MAX_CHAT_ATTACHMENTS = 10;
const MB = 1024 * 1024;
export const IMAGE_MAX_BYTES = 10 * MB;
export const FILE_MAX_BYTES = 20 * MB;

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
    const max = f.kind === 'IMAGE' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
    if (f.size && f.size > max) {
      return `حجم ${f.name} أكبر من ${max / MB} ميجابايت`;
    }
    if (f.kind === 'FILE' && !DOCUMENT_TYPES.includes(f.mimeType)) {
      return 'نوع الملف غير مدعوم. المسموح: PDF و Word و Excel';
    }
  }
  return null;
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
  return { label: 'FILE', color: '#64748B' };
}

/** The chats list preview of a conversation's last message. */
export function lastMessagePreview(
  last: {
    type: string;
    content: string | null;
    attachmentsCount?: number;
    attachmentName?: string | null;
  } | null,
): string {
  if (!last) return 'بدء المحادثة';
  const count = last.attachmentsCount ?? 0;
  if (last.type === 'FILE') return `📎 ${last.attachmentName || 'ملف'}`;
  if (last.type === 'IMAGE') return count > 1 ? `📷 ${count} صور` : '📷 صورة';
  if (last.type === 'PROPERTY') return '🏠 مشاركة عقار';
  return last.content || '';
}
