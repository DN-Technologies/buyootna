import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ServiceSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID: string;
  disabled?: boolean;
}

// Figma famicons:toggle (8455:25731 off / 8455:25732 on): a 28.4 × 16 pill
// with the knob cut out, navy when on and grey when off. Drawn as the
// design's own paths; SVG isn't mirrored under the app's forced RTL, so the
// knob sits where the design puts it.
const ON_PATH =
  'M20.4444 0H8C3.58889 0 0 3.58889 0 8C0 12.4111 3.58889 16 8 16H20.4444C24.8556 16 28.4444 12.4111 28.4444 8C28.4444 3.58889 24.8556 0 20.4444 0ZM20.4444 14.2222C19.2138 14.2222 18.0108 13.8573 16.9876 13.1736C15.9643 12.4899 15.1668 11.5181 14.6959 10.3811C14.2249 9.24418 14.1017 7.9931 14.3418 6.7861C14.5819 5.57911 15.1745 4.47042 16.0447 3.60022C16.9149 2.73003 18.0236 2.13742 19.2306 1.89734C20.4375 1.65725 21.6886 1.78047 22.8256 2.25142C23.9625 2.72236 24.9343 3.51988 25.618 4.54312C26.3017 5.56636 26.6667 6.76936 26.6667 8C26.6649 9.64969 26.0088 11.2313 24.8423 12.3978C23.6758 13.5643 22.0941 14.2205 20.4444 14.2222Z';
const OFF_PATH =
  'M8 0H20.4444C24.8556 0 28.4444 3.58889 28.4444 8C28.4444 12.4111 24.8556 16 20.4444 16H8C3.58889 16 0 12.4111 0 8C0 3.58889 3.58889 0 8 0ZM8 14.2222C9.23064 14.2222 10.4336 13.8573 11.4569 13.1736C12.4801 12.4899 13.2776 11.5181 13.7486 10.3811C14.2195 9.24418 14.3428 7.9931 14.1027 6.7861C13.8626 5.57911 13.27 4.47042 12.3998 3.60022C11.5296 2.73003 10.4209 2.13742 9.2139 1.89734C8.0069 1.65725 6.75582 1.78047 5.61886 2.25142C4.4819 2.72236 3.51012 3.51988 2.82641 4.54312C2.1427 5.56636 1.77778 6.76936 1.77778 8C1.77954 9.64969 2.43566 11.2313 3.60217 12.3978C4.76868 13.5643 6.35031 14.2205 8 14.2222Z';

/** The visibility switch of the الخدمات rows, at the design's size. */
export default function ServiceSwitch({
  value,
  onValueChange,
  testID,
  disabled,
}: ServiceSwitchProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      // The pill is small: a finger-sized area around it
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {/* The design's 49.6 × 24 slot, the pill on its left (end, under RTL) */}
      <View className="h-6 w-[49.6px] items-end justify-center">
        <Svg width={28.444} height={16} viewBox="0 0 28.4444 16">
          <Path d={value ? ON_PATH : OFF_PATH} fill={value ? '#15304D' : '#A0A0A0'} />
        </Svg>
      </View>
    </Pressable>
  );
}
