import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface RequestOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  // Hidden when the client's account isn't known
  onReport?: () => void;
}

/**
 * ⋮ on تفاصيل الطلب (Figma 4410:165208): اضافة الى المفضلة (or إزالة
 * من المفضلة once saved) and الإبلاغ عن المستخدم in red.
 */
export default function RequestOptionsMenu({
  visible,
  onClose,
  isSaved,
  onToggleSave,
  onReport,
}: RequestOptionsMenuProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  const item = (
    label: string,
    onPress: () => void,
    testID: string,
    color: string,
  ) => (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.7}
      onPress={() => {
        onClose();
        onPress();
      }}
      // At least 32px with room for the whole line (Android cut it before)
      className="min-h-8 justify-center py-1"
    >
      <Text
        className="font-cairo-regular text-[14px] leading-[21px]"
        style={{ color, writingDirection: 'rtl', letterSpacing: -0.408 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable testID="request-options-backdrop" className="flex-1" onPress={onClose}>
        {/* Under the ⋮ at the header's visual left (right-* under forced RTL) */}
        <View
          className="absolute right-4 w-[196px] gap-0.5 rounded-[6px] bg-white p-3"
          style={{
            top: insets.top + 52,
            elevation: 3,
            shadowColor: '#212529',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          {item(
            isSaved ? 'إزالة من المفضلة' : 'اضافة الى المفضلة',
            onToggleSave,
            'request-options-save',
            '#111111',
          )}
          {onReport &&
            item(
              'الإبلاغ عن المستخدم',
              onReport,
              'request-options-report',
              '#9C1E28',
            )}
        </View>
      </Pressable>
    </Modal>
  );
}
