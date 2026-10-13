import { requireOptionalNativeModule } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { ChatAttachment, chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_');

// android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
const GRANT_READ = 1;

/**
 * Whether this build can hand a file to the phone's own viewer. The module
 * behind it is native: builds released before it was added don't have it,
 * and they receive this code by OTA all the same.
 */
const hasAndroidViewer = () =>
  Platform.OS === 'android' &&
  !!requireOptionalNativeModule('ExpoIntentLauncher');

/** Opens a downloaded file in the phone's viewer; false when none took it. */
async function openInAndroidViewer(fileUri: string, mimeType: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const IntentLauncher = require('expo-intent-launcher');
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      type: mimeType,
      flags: GRANT_READ,
    });
    return true;
  } catch (error) {
    // No app on the phone opens this type
    console.warn('No viewer took the file:', error);
    return false;
  }
}

// A link signed moments ago: the one in the message may have expired
async function freshLink(attachment: ChatAttachment) {
  try {
    return await chatService.attachmentUrl(attachment.id);
  } catch {
    return attachment.url;
  }
}

/**
 * Opens a chat document to be read.
 *
 * Android, QA: tapping a PDF went straight to the share chooser. Now:
 *  - a build with the viewer module opens any document in the phone's own
 *    viewer (PDF reader, Word, Excel...);
 *  - a build without it (released before the module) shows a PDF in the
 *    in-app browser tab, from its signed link;
 *  - anything left falls back to the share sheet, as before.
 * iOS keeps the system sheet, which previews the document.
 *
 * Signed links expire after 15 minutes: an expired one is re-signed once
 * and retried.
 */
export async function openChatFile(attachment: ChatAttachment) {
  try {
    const viewer = hasAndroidViewer();
    if (
      Platform.OS === 'android' &&
      !viewer &&
      attachment.mimeType === 'application/pdf'
    ) {
      await WebBrowser.openBrowserAsync(await freshLink(attachment));
      return;
    }

    const target = `${FileSystem.cacheDirectory}${attachment.id}-${safeName(attachment.fileName)}`;
    let result = await FileSystem.downloadAsync(attachment.url, target);
    if (result.status === 403) {
      const fresh = await chatService.attachmentUrl(attachment.id);
      result = await FileSystem.downloadAsync(fresh, target);
    }
    if (result.status !== 200) throw new Error(`status ${result.status}`);

    if (viewer && (await openInAndroidViewer(result.uri, attachment.mimeType))) {
      return;
    }

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
