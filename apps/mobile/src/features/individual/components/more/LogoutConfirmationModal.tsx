import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface LogoutConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function LogoutConfirmationModal({
  visible,
  title,
  description,
  onConfirm,
  onClose,
}: LogoutConfirmationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end">
        {/* Dimmed backdrop */}
        <Pressable
          className="absolute inset-0 bg-transparent"
          onPress={onClose}
        />

        {/* White modal container */}
        <View className="items-center rounded-t-[32px] bg-white px-6 pb-12 pt-4 shadow-lg">
          {/* Drag Handle */}
          <View className="mb-8 h-1.5 w-12 rounded-full bg-[#111111]" />

          {/* Circular Logout Icon Badge */}
          <View className="mb-6 h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F5F7F9]">
            <Feather name="log-out" size={26} color="#15304D" />
          </View>

          {/* Title */}
          <Text className="mb-2 text-center font-cairo-bold text-[18px] text-[#111111]">
            {title}
          </Text>

          {/* Description */}
          <Text className="mb-8 px-4 text-center font-cairo text-sm leading-[22px] text-[#64748B]">
            {description}
          </Text>

          {/* Action Buttons */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={() => {
                onConfirm();
                onClose();
              }}
              className="h-[44px] w-full flex-row items-center justify-center rounded-full bg-[#9C1E28]"
            >
              <Text className="font-cairo-bold text-[14px] text-white">
                تسجيل الخروج
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="h-[44px] w-full flex-row items-center justify-center rounded-full border border-gray-200 bg-white"
            >
              <Text className="font-cairo-bold text-[14px] text-[#111111]">
                تراجع
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
