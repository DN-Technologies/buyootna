import { TouchableOpacity, View } from 'react-native';

export interface AlertToggleProps {
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
  // 'sm' on the alert card, 'lg' in the details sheet header
  size?: 'sm' | 'lg';
}

const SIZES = {
  sm: { width: 24, height: 14, knob: 10 },
  lg: { width: 42, height: 24, knob: 20 },
};

export default function AlertToggle({
  isOn,
  onToggle,
  testID,
  size = 'sm',
}: AlertToggleProps) {
  const { width, height, knob } = SIZES[size];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      testID={testID ?? 'alert-toggle-switch'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
      accessibilityLabel={isOn ? 'تفعيل التنبيه' : 'ايقاف التنبيه'}
      style={{
        width,
        height,
        borderRadius: 12,
        backgroundColor: isOn ? '#15304D' : '#D7D7D7',
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isOn ? 'flex-start': 'flex-end',
      }}
    >
      <View
        style={{
          width: knob,
          height: knob,
          borderRadius: knob / 2,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  );
}
