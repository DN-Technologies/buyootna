import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export interface AdsOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  allHidden?: boolean;
  onToggleVisibilityPress: () => void;
  onDeleteAllPress: () => void;
  disabled?: boolean;
}

export default function AdsOptionsMenu({
  visible,
  onClose,
  allHidden = false,
  onToggleVisibilityPress,
  onDeleteAllPress,
  disabled = false,
}: AdsOptionsMenuProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1" onPress={onClose}>
        {/* Dropdown positioned beneath the top-left 3-dots icon */}
        <View
          className="absolute right-[35px] top-[100px] w-[196px] rounded-[6px] border border-[#ECECEC] bg-white p-3 shadow-md shadow-black/10"
          style={{ elevation: 5 }}
        >
          {/* Option 1: Toggle Visibility (Hide or Show all ads) */}
          <TouchableOpacity
            testID="toggle-visibility-menu-item"
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => {
              onClose();
              onToggleVisibilityPress();
            }}
            className={`h-8 justify-center py-1 ${disabled ? 'opacity-40' : ''}`}
          >
            <Text
              className="font-cairo-medium text-[14px] leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {allHidden ? 'اظهار جميع الاعلانات' : 'اخفاء جميع الاعلانات'}
            </Text>
          </TouchableOpacity>

          {/* Option 2: Delete All Ads */}
          <TouchableOpacity
            testID="delete-all-ads-menu-item"
            activeOpacity={0.7}
            disabled={disabled}
            onPress={() => {
              onClose();
              onDeleteAllPress();
            }}
            className={`h-8 justify-center py-1 ${disabled ? 'opacity-40' : ''}`}
          >
            <Text
              className="font-cairo-medium text-[14px] leading-[22px] text-[#9C1E28]"
              style={{ writingDirection: 'rtl' }}
            >
              حذف الكل
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
