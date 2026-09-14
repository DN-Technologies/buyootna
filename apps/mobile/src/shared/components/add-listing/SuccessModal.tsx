import { useRouter } from 'expo-router';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useListingStore } from '@/shared/store/useListingStore';

export interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

// Scalloped green verified rosette badge matching Figma 622:21031
const RosetteCheckBadge = () => (
  <Svg width={74} height={75} viewBox="0 0 74 75" fill="none">
    <Path
      d="M37 0C40.2 0 43.1 1.7 44.7 4.5L46.2 7.1C47.3 9.1 49.3 10.4 51.6 10.7L54.5 11.1C57.7 11.6 60.3 13.9 61.2 17L62 19.8C62.7 22 64.3 23.8 66.5 24.6L69.3 25.6C72.3 26.7 74.3 29.6 74.2 32.8L74.1 35.8C74 38.1 75 40.3 76.7 41.8L79 43.8C81.4 45.9 82.4 49.2 81.5 52.3L80.6 55.1C79.9 57.3 80.1 59.7 81.2 61.7L82.6 64.3C84.1 67.2 83.8 70.7 81.8 73.2L80 75.4C78.4 77.3 77.8 79.9 78.4 82.3L79.1 85.2C79.8 88.4 78.5 91.7 75.8 93.6L73.4 95.3C71.5 96.6 70.3 98.7 70.1 101.1L69.8 104.1C69.5 107.3 67.4 110.1 64.3 111.2L61.4 112.2C59.2 113 57.5 114.7 56.6 116.9L55.5 119.7C54.3 122.7 51.5 124.7 48.3 124.8L45.3 124.9C43 125 40.8 126.1 39.4 127.9L37.6 130.3C35.6 132.8 32.3 133.9 29.2 133.1L26.3 132.4C24.1 131.9 21.7 132.3 19.8 133.5L17.3 135.1C14.5 136.8 10.9 136.7 8.3 134.8L6 133.1C4.2 131.7 1.8 131.3 -0.4 132L-3.3 132.9C-6.5 133.9 -9.9 132.8 -12 130.2L-13.9 127.8C-15.4 126 -17.6 125 -19.9 125L-22.9 125.1C-26.1 125.2 -29 123.3 -30.3 120.3L-31.5 117.6C-32.5 115.4 -34.3 113.8 -36.5 113.1L-39.4 112.2C-42.5 111.2 -44.7 108.4 -45.1 105.2L-45.5 102.2C-45.8 99.8 -47.1 97.7 -49.1 96.5L-51.6 94.9C-54.4 93.1 -55.8 89.8 -55.2 86.6L-54.6 83.7C-54.1 81.3 -54.8 78.7 -56.5 76.9L-58.4 74.8C-60.5 72.4 -60.9 68.9 -59.5 66L-58.2 63.3C-57.2 61.2 -57.1 58.8 -58 56.6L-59 53.8C-60.1 50.7 -59.2 47.3 -56.8 45.1L-54.6 43.1C-52.8 41.5 -51.9 39.2 -52.1 36.9L-52.3 33.9C-52.5 30.7 -50.6 27.7 -47.6 26.5L-44.8 25.4C-42.6 24.5 -41.1 22.7 -40.5 20.4L-39.8 17.6C-39 14.4 -36.5 12 -33.3 11.4L-30.4 10.9C-28.1 10.5 -26.1 9.1 -25.1 7.1L-23.7 4.4C-22.2 1.6 -19.3 -0.1 -16.1 0L-13.1 0.1C-10.8 0.2 -8.6 -0.8 -7.1 -2.5L-5.2 -4.8C-3.1 -7.2 0.2 -8.2 3.3 -7.3L6.2 -6.5C8.4 -5.9 10.8 -6.2 12.8 -7.3L15.3 -8.8C18.1 -10.4 21.6 -10.2 24.2 -8.2L26.4 -6.5C28.3 -5 30.7 -4.6 32.9 -5.3L35.8 -6.1C39 -7.1 42.4 -5.9 44.4 -3.2L46.3 -0.8C47.8 1 50 2 52.3 2L55.3 1.9C58.5 1.8 61.4 3.7 62.7 6.7L63.9 9.4C64.9 11.6 66.7 13.2 68.9 13.9L71.8 14.8C74.9 15.8 77.1 18.6 77.5 21.8L77.9 24.8C78.2 27.2 79.5 29.3 81.5 30.5L84 32.1C86.8 33.9 88.2 37.2 87.6 40.4L87 43.3C86.5 45.7 87.2 48.3 88.9 50.1L90.8 52.2C92.9 54.6 93.3 58.1 91.9 61L90.6 63.7C89.6 65.8 89.5 68.2 90.4 70.4L91.4 73.2C92.5 76.3 91.6 79.7 89.2 81.9L87 83.9C85.2 85.5 84.3 87.8 84.5 90.1L84.7 93.1"
      fill="#4ADE80"
      transform="scale(0.44) translate(46, 20)"
    />
    {/* Inner White Checkmark */}
    <Path
      d="M26 38.5L33.5 46L48 30"
      stroke="white"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SuccessModal({ visible, onClose }: SuccessModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const resetForm = useListingStore((state) => state.resetForm);

  const handleReturnHome = () => {
    onClose();
    resetForm();
    router.replace('/home');
  };

  const handleViewAd = () => {
    onClose();
    resetForm();
    router.replace('/home');
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        {/* --- Bottom Sheet Card matching Figma 622:21031 --- */}
        <View
          className="w-full items-center rounded-t-[24px] bg-white px-5 pt-3 pb-6"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          {/* Top Handle Indicator */}
          <View className="mb-6 h-1 w-11 rounded-full bg-black/30" />

          {/* Scalloped Green Check Badge */}
          <View className="mb-4 items-center justify-center">
            <RosetteCheckBadge />
          </View>

          {/* Title & Subtitle */}
          <Text className="mb-2 text-center font-cairo-semibold text-[20px] text-[#111111]">
            تم إضافة الاعلان بنجاح!
          </Text>
          <Text className="mb-6 text-center font-cairo-medium text-[14px] leading-6 text-[#6B6A6A]">
            يمكن للمستخدمين الآن مشاهدة إعلانك والتواصل معك مباشرة.
          </Text>

          {/* Action Buttons */}
          <View className="w-full flex-col gap-3" style={{ gap: 10 }}>
            {/* 1. Primary View Ad Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleViewAd}
              className="h-[48px] w-full items-center justify-center rounded-[24px] bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-[14px] text-white">
                عرض الإعلان
              </Text>
            </TouchableOpacity>

            {/* 2. Secondary Return Home Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleReturnHome}
              className="h-[48px] w-full items-center justify-center rounded-[24px] border border-[#B28648] bg-white"
            >
              <Text className="font-cairo-semibold text-[14px] text-[#B28648]">
                العودة للرئيسية
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
