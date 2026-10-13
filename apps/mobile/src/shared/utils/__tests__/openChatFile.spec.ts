import { requireOptionalNativeModule } from 'expo';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { ChatAttachment, chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

import { openChatFile } from '../openChatFile';

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  downloadAsync: jest.fn(),
  getContentUriAsync: jest.fn(async () => 'content://files/doc'),
}));
jest.mock('expo-intent-launcher', () => ({ startActivityAsync: jest.fn(async () => ({})) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(async () => ({})) }));
jest.mock('@/shared/api/chat.service', () => ({
  chatService: { attachmentUrl: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const pdf = {
  id: 'a1',
  kind: 'FILE',
  fileName: 'عقد.pdf',
  mimeType: 'application/pdf',
  size: 1000,
  url: 'https://s3/doc.pdf?sig=old',
} as ChatAttachment;
const word = {
  ...pdf,
  id: 'a2',
  fileName: 'x.docx',
  mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as ChatAttachment;

const setPlatform = (os: 'ios' | 'android') =>
  Object.defineProperty(Platform, 'OS', { get: () => os, configurable: true });
const hasViewerModule = (yes: boolean) =>
  (requireOptionalNativeModule as jest.Mock).mockReturnValue(yes ? {} : null);

describe('openChatFile', () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
      status: 200,
      uri: 'file:///cache/a1-doc.pdf',
    });
    (chatService.attachmentUrl as jest.Mock).mockResolvedValue('https://s3/doc.pdf?sig=new');
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
  });
  afterAll(() => setPlatform(originalOS as 'ios' | 'android'));

  describe('Android', () => {
    beforeEach(() => setPlatform('android'));

    // QA: tapping a PDF went straight to the share chooser
    it('opens a document in the phone\'s viewer when the build has it', async () => {
      hasViewerModule(true);

      await openChatFile(pdf);

      expect(FileSystem.getContentUriAsync).toHaveBeenCalledWith('file:///cache/a1-doc.pdf');
      expect(IntentLauncher.startActivityAsync).toHaveBeenCalledWith(
        'android.intent.action.VIEW',
        { data: 'content://files/doc', type: 'application/pdf', flags: 1 },
      );
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
      expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
    });

    it('falls back to the share sheet when no app opens that type', async () => {
      hasViewerModule(true);
      (IntentLauncher.startActivityAsync as jest.Mock).mockRejectedValueOnce(
        new Error('No Activity found to handle Intent'),
      );

      await openChatFile(word);

      expect(Sharing.shareAsync).toHaveBeenCalled();
      expect(showAlert).not.toHaveBeenCalled();
    });

    it('shows a PDF in the in-app browser on a build without the viewer', async () => {
      hasViewerModule(false);

      await openChatFile(pdf);

      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://s3/doc.pdf?sig=new');
      expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
      expect(IntentLauncher.startActivityAsync).not.toHaveBeenCalled();
      expect(Sharing.shareAsync).not.toHaveBeenCalled();
    });

    it('uses the message\'s own link for the PDF when a fresh one fails', async () => {
      hasViewerModule(false);
      (chatService.attachmentUrl as jest.Mock).mockRejectedValueOnce(new Error('offline'));

      await openChatFile(pdf);

      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://s3/doc.pdf?sig=old');
    });

    it('keeps the share sheet for Word and Excel on a build without the viewer', async () => {
      hasViewerModule(false);

      await openChatFile(word);

      expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });
  });

  describe('iOS', () => {
    beforeEach(() => {
      setPlatform('ios');
      hasViewerModule(false);
    });

    it('keeps the system sheet, which previews the document', async () => {
      await openChatFile(pdf);

      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'file:///cache/a1-doc.pdf',
        expect.objectContaining({ UTI: 'com.adobe.pdf' }),
      );
      expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
      expect(IntentLauncher.startActivityAsync).not.toHaveBeenCalled();
    });

    it('re-signs an expired link once', async () => {
      (FileSystem.downloadAsync as jest.Mock)
        .mockResolvedValueOnce({ status: 403 })
        .mockResolvedValueOnce({ status: 200, uri: 'file:///cache/a1-doc.pdf' });

      await openChatFile(pdf);

      expect(FileSystem.downloadAsync).toHaveBeenLastCalledWith(
        'https://s3/doc.pdf?sig=new',
        expect.any(String),
      );
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('says so when the file cannot be fetched', async () => {
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({ status: 500 });

      await openChatFile(pdf);

      expect(showAlert).toHaveBeenCalledWith('خطأ', 'تعذر فتح الملف، حاول مرة أخرى');
    });
  });
});
