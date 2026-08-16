import { Feather } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export interface AlertSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onViewAlerts: () => void;
  onReturnHome: () => void;
}

export default function AlertSuccessModal({
  visible,
  onClose,
  onViewAlerts,
  onReturnHome,
}: AlertSuccessModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View className="w-full items-center rounded-2xl bg-white p-6 shadow-xl">
          {/* --- Success Icon --- */}
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]">
              <Feather name="check" size={32} color="white" />
            </View>
          </View>

          {/* --- Text Content --- */}
          <Text className="mb-2 text-center font-cairo-bold text-xl text-[#111111]">
            تم تفعيل التنبيه
          </Text>
          <Text className="mb-8 text-center font-cairo-medium text-[13px] leading-5 text-[#64748B]">
            سنخبرك فور توفر نتائج مطابقة لاهتماماتك
          </Text>

          {/* --- Actions --- */}
          <View className="w-full flex-col gap-3" style={{ gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onViewAlerts}
              className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
            >
              <Text className="font-cairo-bold text-[15px] text-white">
                عرض تنبيهاتي
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReturnHome}
              className="h-12 w-full items-center justify-center rounded-full border border-[#D4AF37] bg-white"
            >
              <Text className="font-cairo-bold text-[15px] text-[#D4AF37]">
                العودة للرئيسية
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
