import { Text, TouchableOpacity } from 'react-native';

interface CompanySubmitButtonProps {
  label: string;
  disabled: boolean;
  onPress: () => void;
}

// The fixed bottom CTA shared by company form screens (add-service,
// add-project): navy when enabled, grey when disabled
export default function CompanySubmitButton({
  label,
  disabled,
  onPress,
}: CompanySubmitButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      className={`h-12 w-full items-center justify-center rounded-full ${
        disabled ? 'bg-[#A6A6A6]' : 'bg-[#15304D]'
      }`}
    >
      <Text className="font-cairo-semibold text-[14px] text-white">{label}</Text>
    </TouchableOpacity>
  );
}
