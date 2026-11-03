import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export interface OptionsMenuItem {
  key: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
}

/** The ⋮ dropdown (Figma 5732:146476, 4494:147363): plain rows, red to delete. */
export default function OptionsMenu({
  visible,
  items,
  onClose,
}: {
  visible: boolean;
  items: OptionsMenuItem[];
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable testID="options-menu-backdrop" className="flex-1" onPress={onClose}>
        {/* Under the ⋮ on the left: the app's RTL swaps left and right */}
        <View
          className="absolute right-4 top-[100px] w-[200px] rounded-[6px] border border-[#ECECEC] bg-white p-3 shadow-md shadow-black/10"
          style={{ elevation: 5 }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.key}
              testID={`options-menu-${item.key}`}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                item.onPress();
              }}
              className="h-8 justify-center py-1"
            >
              <Text
                className={`font-cairo-medium text-[14px] leading-[22px] ${
                  item.danger ? 'text-[#9C1E28]' : 'text-[#111111]'
                }`}
                style={{ writingDirection: 'rtl' }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
