import { Feather } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface MapCenterPinProps {
  isLoadingAddress: boolean;
}

export function MapCenterPin({ isLoadingAddress }: MapCenterPinProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
        className="items-center justify-center"
      >
        <View className="items-center justify-center pb-9">
          {/* Floating Badge above pin */}
          <View className="mb-1 rounded-full bg-[#15304D] px-3 py-1 shadow-md">
            <Text className="font-cairo-semibold text-xs leading-[20px] text-white">
              اسحب الخريطة لتحديد الموقع
            </Text>
          </View>

          {/* Pin Header */}
          <View className="h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#15304D] shadow-2xl">
            {isLoadingAddress ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Feather name="map-pin" size={22} color="white" />
            )}
          </View>

          {/* Pin Arrow Tip */}
          <View
            className="h-2.5 w-2.5 rotate-45 bg-[#15304D]"
            style={{ marginTop: -5 }}
          />

          {/* Pin Base Shadow */}
          <View
            className="h-2 w-5 rounded-full bg-black/20"
            style={{ marginTop: 2 }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
