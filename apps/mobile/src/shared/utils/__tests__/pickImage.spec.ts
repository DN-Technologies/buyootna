import * as ImagePicker from 'expo-image-picker';

import { showAlert } from '@/shared/utils/alert';

import { pickSquareImage } from '../pickImage';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const picker = ImagePicker as unknown as Record<string, jest.Mock>;
type Button = { text: string; onPress?: () => void };
const press = (text: string) => {
  const [, , buttons] = (showAlert as jest.Mock).mock.calls[0] as [
    string,
    string,
    Button[],
  ];
  buttons.find((b) => b.text === text)!.onPress!();
};
const asset = {
  canceled: false,
  assets: [{ uri: 'file://logo.jpg', fileName: 'IMG_1.jpg', mimeType: 'image/jpeg' }],
};

describe('pickSquareImage', () => {
  beforeEach(() => jest.clearAllMocks());

  // QA: «إضافة لوجو» opened the Files app
  it('offers the camera and the photo library, never the Files app', () => {
    void pickSquareImage();
    const [title, , buttons] = (showAlert as jest.Mock).mock.calls[0] as [
      string,
      string,
      Button[],
    ];
    expect(title).toBe('إضافة صورة');
    expect(buttons.map((b) => b.text)).toEqual([
      'التقاط صورة',
      'اختيار من المعرض',
      'إلغاء',
    ]);
  });

  // QA: a refused photo permission left people stuck; the system picker
  // needs none, so it isn't asked for
  it('picks a square-cropped photo from the library, asking no permission', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue(asset);
    const picked = pickSquareImage();
    press('اختيار من المعرض');

    await expect(picked).resolves.toEqual({
      uri: 'file://logo.jpg',
      name: 'IMG_1.jpg',
      mimeType: 'image/jpeg',
    });
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, aspect: [1, 1] }),
    );
    expect(picker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  });

  it('takes a photo with the camera', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    picker.launchCameraAsync.mockResolvedValue(asset);
    const picked = pickSquareImage();
    press('التقاط صورة');

    await expect(picked).resolves.toMatchObject({ uri: 'file://logo.jpg' });
  });

  it('gives nothing when not allowed or cancelled; a refused camera offers Settings', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const denied = pickSquareImage();
    press('التقاط صورة');
    await expect(denied).resolves.toBeNull();
    // iOS asks only once: the way on is the app's page in Settings
    const [title, , buttons] = (showAlert as jest.Mock).mock.calls[1] as [
      string,
      string,
      Button[],
    ];
    expect(title).toBe('الإذن مطلوب');
    expect(buttons.map((b) => b.text)).toEqual(['فتح الإعدادات', 'إلغاء']);

    (showAlert as jest.Mock).mockClear();
    const cancelled = pickSquareImage();
    press('إلغاء');
    await expect(cancelled).resolves.toBeNull();
  });
});
