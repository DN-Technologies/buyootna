import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { useListingStore } from '@/core/store/useListingStore';

export interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SuccessModal({ visible, onClose }: SuccessModalProps) {
  const router = useRouter();
  const resetForm = useListingStore((state) => state.resetForm);

  const handleReturnHome = () => {
    onClose();
    resetForm(); // Clear the Zustand draft store
    router.replace('/(main)/home'); // Navigate back to the main feed
  };

  const handleViewAd = () => {
    onClose();
    resetForm();
    // Navigate to the published ad details screen (mocked ID here)
    // router.push('/listing/123');
    router.replace('/(main)/home');
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View className="w-full items-center rounded-2xl bg-white p-6 shadow-xl">
          {/* --- 1. Success Icon --- */}
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/10">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]">
              <Feather name="check" size={32} color="white" />
            </View>
          </View>

          {/* --- 2. Text Content --- */}
          <Text className="mb-2 text-center font-cairo-bold text-xl text-[#111111]">
            تم إضافة الاعلان بنجاح!
          </Text>
          <Text className="mb-8 text-center font-cairo-medium text-[13px] leading-5 text-[#64748B]">
            يمكن للمستخدمين الآن مشاهدة إعلانك والتواصل{'\n'}معك مباشرة.
          </Text>

          {/* --- 3. Actions --- */}
          <View className="w-full flex-col gap-3" style={{ gap: 12 }}>
            {/* View Ad Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleViewAd}
              className="h-12 w-full items-center justify-center rounded-lg bg-[#15304D]"
            >
              <Text className="font-cairo-bold text-[15px] text-white">
                عرض الإعلان
              </Text>
            </TouchableOpacity>

            {/* Return to Home Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleReturnHome}
              className="h-12 w-full items-center justify-center rounded-lg border border-[#D4AF37] bg-white"
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
