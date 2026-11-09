import * as ImagePicker from 'expo-image-picker';

import { showAlert } from '@/shared/utils/alert';

/** A picked image, ready for a multipart upload. */
export interface PickedImage {
  uri: string;
  name: string;
  mimeType: string;
}

const PICK_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

const toPicked = (
  result: ImagePicker.ImagePickerResult,
  fallbackName: string,
): PickedImage | null => {
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || fallbackName,
    mimeType: asset.mimeType || 'image/jpeg',
  };
};

async function fromCamera(name: string): Promise<PickedImage | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    showAlert('صلاحية مطلوبة', 'عذراً، نحتاج إلى إذن لاستخدام الكاميرا.');
    return null;
  }
  return toPicked(await ImagePicker.launchCameraAsync(PICK_OPTIONS), name);
}

async function fromLibrary(name: string): Promise<PickedImage | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    showAlert(
      'صلاحية مطلوبة',
      'عذراً، نحتاج إلى إذن للوصول إلى معرض الصور الخاص بك.',
    );
    return null;
  }
  return toPicked(
    await ImagePicker.launchImageLibraryAsync(PICK_OPTIONS),
    name,
  );
}

/**
 * «التقاط صورة» or «اختيار من المعرض», then a square crop: for a logo.
 * It opened the Files app, where people don't keep their photos (QA).
 * Resolves null when cancelled or not allowed.
 */
export function pickSquareImage(name = 'logo.jpg'): Promise<PickedImage | null> {
  return new Promise((resolve) => {
    showAlert('إضافة صورة', undefined, [
      {
        text: 'التقاط صورة',
        onPress: () => void fromCamera(name).then(resolve),
      },
      {
        text: 'اختيار من المعرض',
        onPress: () => void fromLibrary(name).then(resolve),
      },
      { text: 'إلغاء', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
