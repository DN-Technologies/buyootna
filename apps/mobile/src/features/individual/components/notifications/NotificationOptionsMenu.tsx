import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppNotification } from '@/shared/api/notifications.service';

interface NotificationOptionsMenuProps {
  visible: boolean;
  notification: AppNotification | null;
  anchorY?: number;
  onClose: () => void;
  onMarkAsRead: (notification: AppNotification) => void;
  onDelete: (notification: AppNotification) => void;
}

export default function NotificationOptionsMenu({
  visible,
  notification,
  anchorY = 180,
  onClose,
  onMarkAsRead,
  onDelete,
}: NotificationOptionsMenuProps) {
  if (!visible || !notification) return null;

  const screenHeight = Dimensions.get('window').height;
  // Keep dropdown within screen bounds
  const top = Math.min(Math.max(anchorY, 100), screenHeight - 160);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className=" bg-black/10">
        <View
          style={{ top, right: 40 }}
          className="absolute w-[180px] rounded-[6px] bg-white p-3 shadow-lg"
        >
          {/* Mark as read option */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onMarkAsRead(notification);
            }}
            className="w-full py-2"
          >
            <Text
              className="font-cairo text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {notification.isRead ? 'تعليم كغير مقروء' : 'تعليم كمقروء'}
            </Text>
          </TouchableOpacity>

          {/* Delete option */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onDelete(notification);
            }}
            className="w-full py-2"
          >
            <Text
              className="font-cairo text-[14px] text-[#9C1E28]"
              style={{ writingDirection: 'rtl' }}
            >
              حذف
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
