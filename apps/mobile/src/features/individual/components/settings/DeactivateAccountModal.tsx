import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface DeactivateAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog modal for temporary account deactivation,
 * displayed when the user initiates account deactivation from Settings.
 */
export default function DeactivateAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeactivateAccountModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          testID="deactivate-modal-backdrop"
          className="flex-1 items-center justify-center bg-black/50 px-6"
        >
          <TouchableWithoutFeedback>
            <View
              testID="deactivate-modal-content"
              className="w-full max-w-[340px] items-center rounded-[24px] bg-white px-6 py-7"
            >
              {/* Title */}
              <Text className="mb-3 text-center font-cairo-bold text-[18px] text-[#111111]">
                تعطيل الحساب مؤقتاً
              </Text>

              {/* Subtitle / Description */}
              <Text
                className="mb-6 text-center font-cairo-medium text-[14px] leading-[22px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                هل تريد تعطيل حسابك مؤقتاً؟ يمكنك تسجيل الدخول مرة أخرى في أي
                وقت لتنشيطه.
              </Text>

              {/* Buttons Stack */}
              <View className="w-full gap-3">
                {/* Cancel Button */}
                <TouchableOpacity
                  testID="deactivate-modal-cancel"
                  activeOpacity={0.8}
                  onPress={onClose}
                  className="h-[48px] w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
                >
                  <Text className="font-cairo-semibold text-[14px] text-[#111111]">
                    إلغاء
                  </Text>
                </TouchableOpacity>

                {/* Deactivate Confirm Button */}
                <TouchableOpacity
                  testID="deactivate-modal-confirm"
                  activeOpacity={0.8}
                  onPress={onConfirm}
                  className="h-[48px] w-full items-center justify-center rounded-full bg-[#15304D]"
                >
                  <Text className="font-cairo-semibold text-[14px] text-white">
                    تعطيل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
