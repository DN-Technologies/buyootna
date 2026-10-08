import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { ChatAttachment, chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_');

/**
 * Downloads a chat document to the cache and opens the system preview /
 * share sheet. Signed links expire after 15 minutes: an expired one is
 * re-signed once and retried.
 */
export async function openChatFile(attachment: ChatAttachment) {
  const target = `${FileSystem.cacheDirectory}${attachment.id}-${safeName(attachment.fileName)}`;
  try {
    let result = await FileSystem.downloadAsync(attachment.url, target);
    if (result.status === 403) {
      const fresh = await chatService.attachmentUrl(attachment.id);
      result = await FileSystem.downloadAsync(fresh, target);
    }
    if (result.status !== 200) throw new Error(`status ${result.status}`);
    if (!(await Sharing.isAvailableAsync())) {
      showAlert('تنبيه', 'لا يمكن فتح الملف على هذا الجهاز');
      return;
    }
    await Sharing.shareAsync(result.uri, {
      mimeType: attachment.mimeType,
      dialogTitle: attachment.fileName,
      UTI: attachment.mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
    });
  } catch (error) {
    console.error('Failed to open chat file:', error);
    showAlert('خطأ', 'تعذر فتح الملف، حاول مرة أخرى');
  }
}
