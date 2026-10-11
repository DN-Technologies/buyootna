import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export interface AlertsOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onDeleteAllPress: () => void;
  // Reused by the ads tab; defaults keep the alerts menu as it was
  deleteAllLabel?: string;
  deleteAllTestID?: string;
  deleteAllDisabled?: boolean;
}

export default function AlertsOptionsMenu({
  visible,
  onClose,
  onDeleteAllPress,
  deleteAllLabel = 'حذف جميع التنبيهات',
  deleteAllTestID = 'delete-all-alerts-menu-item',
  deleteAllDisabled = false,
}: AlertsOptionsMenuProps) {
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
          // Figma "dropdown1": 172px item inside 12px padding, radius 6, Shadow/Low
          className="absolute right-[22px] top-[105px] w-[196px] rounded-[6px] bg-white p-3"
          style={{
            elevation: 3,
            shadowColor: '#212529',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onDeleteAllPress();
            }}
            testID={deleteAllTestID}
            disabled={deleteAllDisabled}
            className={`h-8 justify-center py-2 ${deleteAllDisabled ? 'opacity-40' : ''}`}
          >
            <Text
              className="font-cairo-medium text-[14px] leading-[21px] text-[#9C1E28]"
              style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
            >
              {deleteAllLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
