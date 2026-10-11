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
          className="absolute right-[30px] top-[105px] w-[180px] rounded-[8px] border border-[#ECECEC] bg-white p-3 shadow-md shadow-black/10"
          style={{ elevation: 5 }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onDeleteAllPress();
            }}
            testID={deleteAllTestID}
            disabled={deleteAllDisabled}
            className={`h-8 justify-center py-1 ${deleteAllDisabled ? 'opacity-40' : ''}`}
          >
            <Text
              className="font-cairo-medium text-[14px] leading-[22px] text-[#9C1E28]"
              style={{ writingDirection: 'rtl' }}
            >
              {deleteAllLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
