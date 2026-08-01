import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ConnectionErrorModalProps {
  visible: boolean;
  onRetry: () => void;
  title?: string;
  message?: string;
  onClose?: () => void;
  isLoading?: boolean;
}

function SignalErrorIcon() {
  return (
    <Svg width="40" height="40" viewBox="0 0 32 32" fill="none">
      {/* Central 'x' cross */}
      <Path
        d="M12 12L20 20M20 12L12 20"
        stroke="#111111"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Left Wave */}
      <Path
        d="M8 11C6.8 12.5 6.8 19.5 8 21"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Outer Left Wave */}
      <Path
        d="M5 8C2.8 10.5 2.8 21.5 5 24"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Inner Right Wave */}
      <Path
        d="M24 11C25.2 12.5 25.2 19.5 24 21"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Outer Right Wave */}
      <Path
        d="M27 8C29.2 10.5 29.2 21.5 27 24"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </Svg>
  );
}

export default function ConnectionErrorModal({
  visible,
  onRetry,
  title = 'خطأ في الاتصال',
  message = 'فشل في التحقق من الاعلانات المتاحة. تأكد من اتصالك بالشبكة',
  onClose,
  isLoading = false,
}: ConnectionErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose || (() => {})}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View className="w-full max-w-[340px] items-center rounded-[28px] bg-white px-6 py-7 shadow-2xl">
              {/* Icon Circle */}
              <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#F4F5F7]">
                <SignalErrorIcon />
              </View>

              {/* Title */}
              <Text className="mb-2 text-center font-cairo-bold text-xl leading-[30px] text-[#111111]">
                {title}
              </Text>

              {/* Message Description */}
              <Text className="mb-6 text-center font-cairo-medium text-sm leading-[22px] text-[#6B6A6A]">
                {message}
              </Text>

              {/* Action Button: Retry */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onRetry}
                disabled={isLoading}
                className="w-full items-center justify-center rounded-full bg-[#15304D] py-3.5"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="font-cairo-bold text-base leading-[24px] text-white">
                    إعادة المحاولة
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
