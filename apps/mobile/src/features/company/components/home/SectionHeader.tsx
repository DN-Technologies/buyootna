import { Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onPressViewAll?: () => void;
}

export default function SectionHeader({
  title,
  onPressViewAll,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5">
      <Text
        className="font-almarai-bold text-[18px] text-black"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressViewAll}
        className="rounded-full px-2 py-1"
      >
        <Text className="font-cairo-semibold text-[14px] leading-[21px] text-[#15304D]">
          عرض الكل
        </Text>
      </TouchableOpacity>
    </View>
  );
}
