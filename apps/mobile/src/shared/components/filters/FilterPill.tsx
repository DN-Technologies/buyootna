import { Text, TouchableOpacity } from 'react-native';

export interface FilterPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function FilterPill({
  label,
  isActive,
  onPress,
}: FilterPillProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`mb-3 flex-row items-center justify-center gap-2 rounded-full border px-5 py-1.5 even:mx-1 ${
        isActive
          ? 'border-[#B28648] bg-white'
          : 'border-transparent bg-[#F5F7F9]'
      }`}
    >
      <Text className="font-cairo text-[13px] text-[#111111]">{label}</Text>
    </TouchableOpacity>
  );
}
