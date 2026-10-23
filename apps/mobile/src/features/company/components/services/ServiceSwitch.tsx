import { Switch } from 'react-native';

interface ServiceSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID: string;
  disabled?: boolean;
}

/** The navy visibility switch of the الخدمات rows (Figma famicons:toggle). */
export default function ServiceSwitch({
  value,
  onValueChange,
  testID,
  disabled,
}: ServiceSwitchProps) {
  return (
    <Switch
      testID={testID}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ true: '#15304D', false: '#D7D7D7' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#D7D7D7"
      style={{ transform: [{ scale: 0.8 }] }}
    />
  );
}
