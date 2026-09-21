import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import { View } from 'react-native';

export function SafeLinearGradient({
  colors,
  style,
  children,
  start,
  end,
  ...props
}: LinearGradientProps) {
  if (LinearGradient) {
    return (
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={style}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  const backgroundColor =
    Array.isArray(colors) && colors.length > 0
      ? String(colors[0])
      : '#FF8D28';

  return <View style={[{ backgroundColor }, style]}>{children}</View>;
}

export default SafeLinearGradient;
