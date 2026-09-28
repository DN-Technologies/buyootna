import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReasonOptionProps {
  id: string;
  title: string;
  checked: boolean;
  onToggle: (id: string) => void;
}

// Checkbox matching Figma 1684:60341 & 1684:60374
function ReasonCheckbox({ checked }: { checked: boolean }) {
  return (
    <View
      className={`h-[18px] w-[18px] items-center justify-center rounded-[4px] ${
        checked ? 'bg-[#15304D]' : 'border border-[#D7D7D7] bg-white'
      }`}
    >
      {checked && <Feather name="check" size={12} color="#FFFFFF" />}
    </View>
  );
}

export default function ReasonOption({
  id,
  title,
  checked,
  onToggle,
}: ReasonOptionProps) {
  return (
    <TouchableOpacity
      testID={`deactivate-reason-${id}`}
      activeOpacity={0.7}
      onPress={() => onToggle(id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className={`h-[40px] flex-row items-center px-3 ${
        checked ? 'rounded-[10px] bg-[#F9FAFE]' : 'bg-transparent'
      }`}
    >
      {/* Checkbox (RTL: left side) */}
      <ReasonCheckbox checked={checked} />
      {/* Title (RTL: right side) */}
      <Text className="font-cairo-medium mx-2 text-[14px] text-[#111111]">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
