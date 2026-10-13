import { Linking } from 'react-native';

import { showAlert } from '@/shared/utils/alert';

const MESSAGES = {
  camera: 'يجب السماح للتطبيق باستخدام الكاميرا لالتقاط صورة. يمكنك تفعيل ذلك من الإعدادات.',
  microphone:
    'يجب السماح للتطبيق باستخدام الميكروفون لتسجيل رسالة صوتية. يمكنك تفعيل ذلك من الإعدادات.',
};

/**
 * A permission the phone will not ask for again: says what is needed and
 * offers the app's page in Settings, where it can be switched on.
 */
export function showPermissionDenied(what: keyof typeof MESSAGES) {
  showAlert('الإذن مطلوب', MESSAGES[what], [
    { text: 'فتح الإعدادات', onPress: () => void Linking.openSettings() },
    { text: 'إلغاء', style: 'cancel' },
  ]);
}
