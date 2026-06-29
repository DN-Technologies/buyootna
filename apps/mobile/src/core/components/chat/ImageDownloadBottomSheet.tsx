import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface ImageDownloadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function ImageDownloadBottomSheet({
  visible,
  onClose,
  onDownload,
}: ImageDownloadBottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-transparent"
          onPress={onClose}
        />
        <View className="rounded-t-[32px] bg-white px-6 pb-12 pt-4 shadow-lg">
          {/* Drag Handle */}
          <View className="mb-8 h-1.5 w-12 self-center rounded-full bg-[#111111]" />

          <TouchableOpacity onPress={onClose} className="p-2">
            <Feather name="x" size={22} color="#111111" />
          </TouchableOpacity>
          <View className="mb-2 flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center gap-2 py-2"
              onPress={() => {
                onDownload();
                onClose();
              }}
            >
              <Feather name="download" size={20} color="#111111" />
              <Text className="font-cairo-medium text-base leading-[24px] text-[#111111]">
                تحميل الصورة
              </Text>
            </TouchableOpacity>
            <View />
          </View>
        </View>
      </View>
    </Modal>
  );
}
