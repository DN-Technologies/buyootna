import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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

/**
 * App-wide replacement for RN's Alert.alert — a single instance mounted at
 * root, driven by useAlertStore. Trigger via showAlert() from
 * @/shared/utils/alert rather than rendering this directly.
 */
export default function AppAlertModal() {
  const { visible, title, message, buttons } = useAlertStore();
  const hideAlert = useAlertStore((s) => s.hideAlert);

  const handleBackdropPress = () => hideAlert();

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    button.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
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
