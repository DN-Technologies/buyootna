import { TouchableOpacity, View } from 'react-native';

export interface AlertToggleProps {
  isOn: boolean;
  onToggle: () => void;
  testID?: string;
}

export default function AlertToggle({
  isOn,
  onToggle,
  testID,
}: AlertToggleProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      testID={testID ?? 'alert-toggle-switch'}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
      accessibilityLabel={isOn ? 'تفعيل التنبيه' : 'ايقاف التنبيه'}
      style={{
        width: 24,
        height: 14,
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
          width: 10,
          height: 10,
          borderRadius: 10,
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
