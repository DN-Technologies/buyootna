import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HeaderOption {
  label: string;
  onPress: () => void;
  testID: string;
  // Red for anything destructive
  danger?: boolean;
}

interface HeaderOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  options: HeaderOption[];
  testID: string;
}

/**
 * The ⋮ dropdown of the company "pages title" header (Figma 4410:169770,
 * 4410:169999): white card under the ⋮, one line per option.
 */
export default function HeaderOptionsMenu({
  visible,
  onClose,
  options,
  testID,
}: HeaderOptionsMenuProps) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable testID={`${testID}-backdrop`} className="flex-1" onPress={onClose}>
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
          {options.map((option) => (
            <TouchableOpacity
              key={option.testID}
              testID={option.testID}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                option.onPress();
              }}
              className="min-h-8 justify-center py-1"
            >
              <Text
                className="font-cairo-regular text-[14px] leading-[21px]"
                style={{
                  color: option.danger ? '#9C1E28' : '#111111',
                  writingDirection: 'rtl',
                  letterSpacing: -0.408,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
