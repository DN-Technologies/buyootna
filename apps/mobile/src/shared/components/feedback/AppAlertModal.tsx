import { useRef } from 'react';
import {
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AlertButton, AlertButtonStyle, useAlertStore } from '@/shared/store/useAlertStore';

const BUTTON_STYLES: Record<
  AlertButtonStyle,
  { container: string; text: string }
> = {
  default: {
    container: 'bg-secondary',
    text: 'text-white',
  },
  cancel: {
    container: 'border border-gray-300 bg-white',
    text: 'text-gray-medium',
  },
  destructive: {
    container: 'border border-danger bg-white',
    text: 'text-danger',
  },
};

function AlertButtonView({
  button,
  onPress,
}: {
  button: AlertButton;
  onPress: () => void;
}) {
  const variant = BUTTON_STYLES[button.style ?? 'default'];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`h-12 w-full items-center justify-center rounded-full ${variant.container}`}
    >
      <Text className={`font-cairo-bold text-base ${variant.text}`}>{button.text}</Text>
    </TouchableOpacity>
  );
}

// Longer than the fade: only used if iOS never reports the dismissal
const DISMISS_FALLBACK_MS = 600;

/**
 * App-wide replacement for RN's Alert.alert — a single instance mounted at
 * root, driven by useAlertStore. Trigger via showAlert() from
 * @/shared/utils/alert rather than rendering this directly.
 */
export default function AppAlertModal() {
  const { visible, title, message, buttons } = useAlertStore();
  const hideAlert = useAlertStore((s) => s.hideAlert);

  const handleBackdropPress = () => hideAlert();

  // iOS can't present anything native (the share sheet, a picker) while this
  // modal is still fading out: it drops it, and «مشاركة الملف الشخصي» did
  // nothing (QA). So there the button's action waits for the modal to be
  // gone, with a timer in case onDismiss never comes; Android runs it at once.
  const pending = useRef<(() => void) | null>(null);
  const runPending = () => {
    const action = pending.current;
    pending.current = null;
    action?.();
  };

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    if (!button.onPress) return;
    if (Platform.OS !== 'ios') {
      button.onPress();
      return;
    }
    pending.current = button.onPress;
    setTimeout(runPending, DISMISS_FALLBACK_MS);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
      onDismiss={runPending}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="w-full max-w-[340px] items-center rounded-[28px] bg-white px-6 py-7 shadow-2xl">
              <Text className="mb-2 text-center font-cairo-bold text-xl leading-[30px] text-charcoal">
                {title}
              </Text>
              {!!message && (
                <Text className="mb-6 text-center font-cairo-medium text-sm leading-[22px] text-gray-medium">
                  {message}
                </Text>
              )}
              <View className="w-full gap-3">
                {buttons.map((button, index) => (
                  <AlertButtonView
                    key={index}
                    button={button}
                    onPress={() => handleButtonPress(button)}
                  />
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
