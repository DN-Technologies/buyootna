import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

export default function SelectionModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* justify-end anchors the card as a bottom sheet, sliding up from
          under whatever field opened it -- matches the established
          pattern already used by SelectionDrawer (shared/components/
          filters/SelectionDrawer.tsx). Without it the card defaults to
          the top of the screen despite its rounded-top-corner styling,
          looking like a disconnected full-page overlay instead of a
          sheet anchored to the field that opened it. */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/40">
          <TouchableWithoutFeedback>
            <View className="max-h-[70%] rounded-t-2xl bg-white p-5">
              <Text
                className="mb-4 font-cairo-bold text-lg text-black"
                style={{ writingDirection: 'rtl' }}
              >
                {title}
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="border-b border-gray-100 py-3"
                  >
                    <Text
                      className={`font-cairo-medium text-[14px] ${
                        selectedValue === item
                          ? 'font-bold text-[#15304D]'
                          : 'text-[#111111]'
                      }`}
                      style={{ writingDirection: 'rtl' }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
