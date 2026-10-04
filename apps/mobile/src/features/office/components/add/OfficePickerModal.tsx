import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OfficePickerModalProps {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
}

// The centered single-choice modal used by the office add form's
// governorate and property-category fields.
export default function OfficePickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: OfficePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40 px-6"
      >
        <View className="max-h-[400px] w-full rounded-2xl bg-white p-4">
          <Text className="mb-3 text-center font-cairo-bold text-base text-[#111111]">
            {title}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                onPress={() => onSelect(item)}
                className="border-b border-[#F5F7F9] py-3"
              >
                <Text className="text-right font-cairo-medium text-sm text-[#111111]">
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
