import { Switch, Text, View } from 'react-native';

interface SettingsSwitchItemProps {
  icon: React.ComponentType<{ color?: string; size?: number }>;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

// Icon + title on the right (RTL), toggle on the left
export default function SettingsSwitchItem({
  icon: Icon,
  title,
  value,
  onValueChange,
  testID,
}: SettingsSwitchItemProps) {
  return (
    <View className="flex-row items-center justify-between bg-[#F9FAFE] py-4">
      <View className="flex-row items-center gap-2">
        <Icon color="#111111" size={22} />
        <Text className="font-cairo-medium text-[14px] text-[#111111]">
          {title}
        </Text>
      </View>

      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={title}
        trackColor={{ false: '#E2E8F0', true: '#15304D' }}
        thumbColor="#FFFFFF"
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  );
}
