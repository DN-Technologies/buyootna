import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// iOS number pads have no return key: a "تم" bar above the keyboard
export default function KeyboardDoneBar({ nativeID }: { nativeID: string }) {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={nativeID}>
      <View className="flex-row items-center justify-end border-t border-gray-200 bg-[#F8FAFC] px-4 py-2">
        <TouchableOpacity activeOpacity={0.7} onPress={() => Keyboard.dismiss()}>
          <Text className="font-cairo-bold text-[15px] text-[#15304D]">تم</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}
