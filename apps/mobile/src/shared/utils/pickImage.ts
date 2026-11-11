import * as ImagePicker from 'expo-image-picker';

import { showAlert } from '@/shared/utils/alert';
import { showPermissionDenied } from '@/shared/utils/permissionDenied';

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
    // iOS asks once: after a refusal only Settings can turn it on
    showPermissionDenied('camera');
    return null;
  }
  return toPicked(await ImagePicker.launchCameraAsync(PICK_OPTIONS), name);
}

async function fromLibrary(name: string): Promise<PickedImage | null> {
  // The system photo picker needs no permission (iOS 11+, Android): asking
  // for one left a denied user stuck with no way on (QA)
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
