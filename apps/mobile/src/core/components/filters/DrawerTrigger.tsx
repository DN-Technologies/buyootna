import { Text, TouchableOpacity, View } from 'react-native';

export interface DrawerTriggerProps {
  label: string;
  placeholder: string;
  value?: string;
  onPress: () => void;
}

export default function DrawerTrigger({
  label,
  placeholder,
  value,
  onPress,
}: DrawerTriggerProps) {
  return (
    <View className="mb-6 flex-1">
      <Text
        className="mb-1 font-cairo-medium text-sm text-[#111111]"
        style={{
          writingDirection: 'rtl',
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="h-[40px] justify-center rounded-md border border-gray-200 bg-white px-4"
      >
        <Text
          className={`font-cairo text-[13px] leading-[22px] ${value ? 'text-[#111111]' : 'text-[#979797]'}`}
          style={{
            writingDirection: 'rtl',
          }}
        >
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
