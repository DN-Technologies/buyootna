import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface PortfolioOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  // Every project is hidden: offer to show them again instead
  allHidden: boolean;
  onToggleAllHidden: () => void;
  onDeleteAll: () => void;
}

/**
 * ⋮ on معرض الأعمال (Figma 4410:169770): اخفاء جميع المشاريع (or اظهار
 * جميع المشاريع once all are hidden) and حذف الكل in red.
 */
export default function PortfolioOptionsMenu({
  visible,
  onClose,
  allHidden,
  onToggleAllHidden,
  onDeleteAll,
}: PortfolioOptionsMenuProps) {
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
      <Pressable
        testID="portfolio-options-backdrop"
        className="flex-1"
        onPress={onClose}
      >
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
            allHidden ? 'اظهار جميع المشاريع' : 'اخفاء جميع المشاريع',
            onToggleAllHidden,
            'portfolio-options-toggle-hidden',
            '#111111',
          )}
          {item('حذف الكل', onDeleteAll, 'portfolio-options-delete-all', '#9C1E28')}
        </View>
      </Pressable>
    </Modal>
  );
}
