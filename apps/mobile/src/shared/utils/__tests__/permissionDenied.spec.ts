import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

import { useAlertStore } from '@/shared/store/useAlertStore';

import { takePhoto } from '../chatAttachments';
import { showPermissionDenied } from '../permissionDenied';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));
jest.mock('expo-document-picker', () => ({}));

const alert = () => useAlertStore.getState();

describe('a denied camera or microphone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAlertStore.setState({ visible: false, buttons: [] });
  });

  it('says what is needed and opens the app settings', () => {
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();

    showPermissionDenied('microphone');

    expect(alert().visible).toBe(true);
    expect(alert().title).toBe('الإذن مطلوب');
    expect(alert().message).toContain('الميكروفون');
    expect(alert().buttons.map((b) => b.text)).toEqual(['فتح الإعدادات', 'إلغاء']);

    alert().buttons[0].onPress?.();
    expect(openSettings).toHaveBeenCalled();
  });

  // QA (iOS): after "Don't Allow", the camera button did nothing at all
  it('tells the user when the camera is not allowed, without opening it', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });

    expect(await takePhoto()).toBeNull();

    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(alert().visible).toBe(true);
    expect(alert().message).toContain('الكاميرا');
    expect(alert().buttons[0].text).toBe('فتح الإعدادات');
  });

  it('opens the camera with no alert when it is allowed', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true });

    expect(await takePhoto()).toBeNull();

    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
    expect(alert().visible).toBe(false);
  });
});
